import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SpacesService } from '../spaces.service';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/spaces',
})
export class SpacesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private activeConnections = new Map<string, Set<string>>(); // spaceId -> Set of socketIds

  constructor(private readonly spacesService: SpacesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove client from all spaces
    this.activeConnections.forEach((connections, spaceId) => {
      connections.delete(client.id);
      if (connections.size === 0) {
        this.activeConnections.delete(spaceId);
      } else {
        this.server.to(spaceId).emit('user-left', { socketId: client.id });
      }
    });
  }

  @SubscribeMessage('join-space')
  async handleJoinSpace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { spaceId: string; userId: string },
  ) {
    const { spaceId, userId } = data;
    client.join(spaceId);

    if (!this.activeConnections.has(spaceId)) {
      this.activeConnections.set(spaceId, new Set());
    }
    this.activeConnections.get(spaceId)?.add(client.id);

    // Notify others
    client.to(spaceId).emit('user-joined', { userId, socketId: client.id });

    return { success: true, spaceId };
  }

  @SubscribeMessage('leave-space')
  async handleLeaveSpace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { spaceId: string },
  ) {
    const { spaceId } = data;
    client.leave(spaceId);

    this.activeConnections.get(spaceId)?.delete(client.id);
    if (this.activeConnections.get(spaceId)?.size === 0) {
      this.activeConnections.delete(spaceId);
    }

    client.to(spaceId).emit('user-left', { socketId: client.id });

    return { success: true };
  }

  @SubscribeMessage('speak')
  async handleSpeak(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { spaceId: string; userId: string; audioData: any },
  ) {
    const { spaceId, userId, audioData } = data;
    // Broadcast audio to other participants
    client.to(spaceId).emit('audio-stream', { userId, audioData });
  }

  @SubscribeMessage('whiteboard-update')
  async handleWhiteboardUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { spaceId: string; whiteboardData: any },
  ) {
    const { spaceId, whiteboardData } = data;

    // Update whiteboard in database
    await this.spacesService.updateWhiteboard(spaceId, whiteboardData);

    // Broadcast to other participants
    client.to(spaceId).emit('whiteboard-updated', { whiteboardData });
  }
}

