'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Send, ArrowUpRight, Circle } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

export function Footer() {
    const currentYear = new Date().getFullYear()
    const [time, setTime] = useState('')

    useEffect(() => {
        // Only run on client to avoid hydration mismatch
        const updateTime = () => {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }))
        }
        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [])

    return (
        <footer className="bg-black text-white relative overflow-hidden font-sans border-t border-white/10">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="container-custom relative z-10">
                {/* Top Bar: System Status & Time */}
                <div className="flex justify-between items-center py-4 border-b border-white/10 text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span>All Systems Operational</span>
                    </div>
                    <div>{time}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse border-b border-white/10">

                    {/* Brand Column (Left - 4 cols) */}
                    <div className="lg:col-span-4 py-16 lg:pr-12 lg:pl-0 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 border border-white/20 flex items-center justify-center bg-white/5">
                                    <span className="text-accent text-lg font-mono">&gt;_</span>
                                </div>
                                <span className="font-mono text-xl tracking-widest">HIGHLIT</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                                The premier development platform for the Arab world.
                                <br />
                                Engineering culture meets creative freedom.
                            </p>
                        </div>

                        <div className="mt-12">
                            <h5 className="font-mono text-xs text-gray-500 mb-4 uppercase tracking-wider">Join notification list</h5>
                            <form className="flex border border-white/20 bg-white/5 p-1 max-w-sm focus-within:border-accent transition-colors">
                                <input
                                    type="email"
                                    placeholder="dev@example.com"
                                    className="bg-transparent text-sm w-full px-3 py-2 outline-none placeholder-gray-600 font-mono"
                                />
                                <button type="button" onClick={playClickSound} className="px-4 py-2 bg-white text-black text-xs font-bold font-mono hover:bg-accent hover:text-black transition-colors">
                                    SUBMIT
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Links Columns (Right - 8 cols -> split into 3) */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 divide-x divide-x-reverse border-l border-white/10">

                        {/* Platform */}
                        <div className="p-8 lg:p-12">
                            <h4 className="font-mono text-xs text-gray-500 mb-8 uppercase tracking-wider flex items-center gap-2">
                                <Circle className="w-2 h-2 fill-current" /> Platform
                            </h4>
                            <ul className="space-y-6">
                                {['Feed', 'Rants', 'Code', 'Jobs'].map((item) => (
                                    <li key={item}>
                                        <Link href={`/${item.toLowerCase()}`} onClick={playClickSound} className="group flex items-center justify-between text-gray-400 hover:text-white transition-colors">
                                            <span>{item}</span>
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="p-8 lg:p-12">
                            <h4 className="font-mono text-xs text-gray-500 mb-8 uppercase tracking-wider flex items-center gap-2">
                                <Circle className="w-2 h-2 fill-current" /> Company
                            </h4>
                            <ul className="space-y-6">
                                {['About', 'Blog', 'Careers', 'Brand'].map((item) => (
                                    <li key={item}>
                                        <Link href={`/${item.toLowerCase()}`} onClick={playClickSound} className="group flex items-center justify-between text-gray-400 hover:text-white transition-colors">
                                            <span>{item}</span>
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social */}
                        <div className="p-8 lg:p-12">
                            <h4 className="font-mono text-xs text-gray-500 mb-8 uppercase tracking-wider flex items-center gap-2">
                                <Circle className="w-2 h-2 fill-current" /> Social
                            </h4>
                            <ul className="space-y-6">
                                {[
                                    { name: 'GitHub', icon: Github, href: 'https://github.com' },
                                    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
                                    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
                                    { name: 'Discord', icon: Send, href: 'https://discord.com' }
                                ].map((item) => (
                                    <li key={item.name}>
                                        <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={playClickSound} className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Massive Text Section */}
                <div className="relative pt-24 pb-4 border-b border-white/10 flex justify-center w-full">
                    <h1 className="text-[13vw] leading-[0.85] font-black tracking-tight text-white/10 pointer-events-none select-none text-center w-full">
                        HIGHLIT
                    </h1>
                </div>

                {/* Footer Bottom */}
                <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-mono tracking-widest text-gray-600">
                    <div className="flex gap-6">
                        <span>© {currentYear} HighLit Inc.</span>
                        <span className="hidden md:inline">|</span>
                        <span>Made in Jordan</span>
                    </div>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>

            </div>
        </footer>
    )
}
