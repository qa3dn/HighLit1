import React, { useRef, useState } from 'react';
import { useProfile } from '../useProfile';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  BookOpen,
  Code,
  Globe,
  Plus,
  X
} from 'lucide-react';

const Profile: React.FC = () => {
  const {
    profile,
    isSaving,
    saveSuccess,
    error,
    updateField,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    handleAvatarChange,
    handleSave,
    handleCancel,
  } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleAvatarChange(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 p-6 md:p-10 font-sans selection:bg-emerald-500/30 selection:text-emerald-300" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-zinc-800/40 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-wide">الملف الشخصي</h1>
              <p className="text-zinc-400 text-sm mt-1">عرض وتحديث معلوماتك الشخصية وصورتك الرمزية</p>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">تم حفظ الملف الشخصي بنجاح!</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
            <XCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Profile Card and Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Avatar Section Card */}
          <div className="bg-[#12131a]/90 border border-zinc-800/80 rounded-xl p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center">
            
            {/* Avatar Circular Box */}
            <div className="relative group w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)] bg-zinc-900/40 flex items-center justify-center transition-all duration-300 hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <img
                src={profile.avatarUrl}
                alt="Mustafa Abu Eideh Avatar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Hover Camera Overlay */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer gap-1"
              >
                <Camera className="w-6 h-6 text-white animate-pulse" />
                <span className="text-[10px] text-zinc-300 font-semibold font-arabic">تغيير الصورة</span>
              </button>
            </div>

            {/* Upload Instruction */}
            <div>
              <h3 className="text-base font-bold text-white">{profile.fullName}</h3>
              <p className="text-xs text-zinc-500 mt-1">{profile.role}</p>
              
              <button
                type="button"
                onClick={triggerFileInput}
                className="mt-3 px-4 py-1.5 bg-[#161722] hover:bg-zinc-800 text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-zinc-850 hover:border-emerald-500/30 rounded-lg transition-all duration-200 cursor-pointer"
              >
                تحميل صورة جديدة
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* 1. Personal Information Card */}
          <div className="bg-[#12131a]/90 border border-zinc-800/80 rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-zinc-700/30 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <User className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">المعلومات الشخصية</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 text-white placeholder-zinc-550 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="مثال: مصطفى أبو عبيدة"
                    required
                  />
                  <User className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 text-left text-white placeholder-zinc-550 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="example@highlit.jo"
                    required
                  />
                  <Mail className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">رقم الهاتف (الأردن)</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 text-left text-white placeholder-zinc-550 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="+962 7 9123 4567"
                    required
                  />
                  <Phone className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2" />
                </div>
              </div>

              {/* Role / Position */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">الدور الوظيفي / الصلاحية</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full bg-[#1b1c28]/60 border border-zinc-805 rounded-lg py-2.5 px-4 pr-10 text-zinc-550 cursor-not-allowed select-none outline-none"
                  />
                  <Briefcase className="w-5 h-5 text-zinc-600 absolute top-1/2 right-3 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-arabic">لا يمكن تعديل الصلاحية الوظيفية إلا من قبل الإدارة العليا.</p>
              </div>
            </div>
          </div>

          {/* 2. Skills & Languages Card */}
          <div className="bg-[#12131a]/90 border border-zinc-800/80 rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-zinc-700/30 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <Code className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">المهارات واللغات</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Skills Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>المهارات المهنية</span>
                </div>
                
                {/* Add Skill Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSkill.trim()) {
                            addSkill(newSkill);
                            setNewSkill('');
                          }
                        }
                      }}
                      className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2 px-3 pr-8 text-sm text-white placeholder-zinc-550 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="أضف مهارة جديدة (مثلاً: React)"
                    />
                    <Code className="w-4 h-4 text-zinc-500 absolute top-1/2 right-2.5 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newSkill.trim()) {
                        addSkill(newSkill);
                        setNewSkill('');
                      }
                    }}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center shrink-0 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Skills Tags List */}
                <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-[#161722]/40 border border-zinc-850/60 rounded-xl">
                  {profile.skills.length === 0 ? (
                    <span className="text-xs text-zinc-650 self-center">لا توجد مهارات مضافة حالياً.</span>
                  ) : (
                    profile.skills.map((skill) => (
                      <div
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/25 text-emerald-400 rounded-full text-xs font-medium transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-950/30"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="w-3.5 h-3.5 rounded-full hover:bg-emerald-500/20 flex items-center justify-center text-emerald-500 transition-colors duration-150 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Languages Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>اللغات</span>
                </div>
                
                {/* Add Language Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newLanguage.trim()) {
                            addLanguage(newLanguage);
                            setNewLanguage('');
                          }
                        }
                      }}
                      className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2 px-3 pr-8 text-sm text-white placeholder-zinc-550 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                      placeholder="أضف لغة جديدة (مثلاً: الفرنسية)"
                    />
                    <Globe className="w-4 h-4 text-zinc-500 absolute top-1/2 right-2.5 -translate-y-1/2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newLanguage.trim()) {
                        addLanguage(newLanguage);
                        setNewLanguage('');
                      }
                    }}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center shrink-0 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Languages Tags List */}
                <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-[#161722]/40 border border-zinc-850/60 rounded-xl">
                  {profile.languages.length === 0 ? (
                    <span className="text-xs text-zinc-650 self-center">لا توجد لغات مضافة حالياً.</span>
                  ) : (
                    profile.languages.map((lang) => (
                      <div
                        key={lang}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/25 text-emerald-400 rounded-full text-xs font-medium transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-950/30"
                      >
                        <span>{lang}</span>
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="w-3.5 h-3.5 rounded-full hover:bg-emerald-500/20 flex items-center justify-center text-emerald-500 transition-colors duration-150 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 3. Bio Card */}
          <div className="bg-[#12131a]/90 border border-zinc-800/80 rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-zinc-700/30 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">نبذة تعريفية</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">السيرة الذاتية / الوصف المختصر</label>
              <div className="relative">
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={4}
                  className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 text-white placeholder-zinc-550 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك..."
                  maxLength={300}
                />
                <BookOpen className="w-5 h-5 text-zinc-500 absolute top-3 right-3" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>اكتب سيرة مهنية موجزة تظهر في صفحتك العامة</span>
                <span>{profile.bio.length} / 300 حرف</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2.5 bg-transparent border border-zinc-800 hover:bg-zinc-800/40 hover:border-zinc-700 text-zinc-400 hover:text-white font-medium rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إلغاء</span>
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default Profile;
