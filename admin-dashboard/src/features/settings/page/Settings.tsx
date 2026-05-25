import { useSettings } from '../useSettings';
import {
  Settings as SettingsIcon,
  Globe,
  Clock,
  Lock,
  Mail,
  Bell,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Building
} from 'lucide-react';

const Settings: React.FC = () => {
  const {
    settings,
    isSaving,
    saveSuccess,
    error,
    updateField,
    toggleField,
    handleSave,
    handleCancel,
  } = useSettings();

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 p-6 md:p-10 font-sans selection:bg-emerald-500/30 selection:text-emerald-300" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex items-center gap-4 border-b border-zinc-800/40 pb-6">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <SettingsIcon className="w-8 h-8 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">الإعدادات</h1>
            <p className="text-zinc-400 text-sm mt-1">تخصيص النظام، إدارة الحماية، والتنبيهات للوحة التحكم</p>
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">تم حفظ التعديلات بنجاح!</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
            <XCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* 1. General Settings Card */}
          <div className="bg-[#12131a]/90 border border-zinc-800/80 rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-zinc-700/30 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <Building className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">إعدادات النظام الأساسية</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">اسم النظام</label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => updateField('systemName', e.target.value)}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="أدخل اسم النظام"
                    required
                  />
                  <Building className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2" />
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">لغة العرض</label>
                <div className="relative">
                  <select
                    value={settings.language}
                    onChange={(e) => updateField('language', e.target.value as 'ar' | 'en')}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 pl-4 text-white outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                  >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">الإنجليزية (English)</option>
                  </select>
                  <Globe className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Timezone Selection */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300">المنطقة الزمنية</label>
                <div className="relative">
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 pl-4 text-white outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                  >
                    <option value="Asia/Riyadh">(GMT+03:00) الرياض / مكة المكرمة</option>
                    <option value="Asia/Dubai">(GMT+04:00) دبي / أبوظبي</option>
                    <option value="Africa/Cairo">(GMT+02:00) القاهرة</option>
                    <option value="UTC">(GMT+00:00) التوقيت العالمي المنسق</option>
                  </select>
                  <Clock className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Security Settings Card */}
          <div className="bg-[#12131a]/90 border border-zinc-800/80 rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-zinc-700/30 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">إعدادات الأمان والحماية</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">كلمة المرور الحالية</label>
                <div className="relative">
                  <input
                    type="password"
                    value={settings.currentPassword}
                    onChange={(e) => updateField('currentPassword', e.target.value)}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="••••••••"
                  />
                  <Lock className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2" />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) => updateField('newPassword', e.target.value)}
                    className="w-full bg-[#161722] border border-zinc-800 rounded-lg py-2.5 px-4 pr-10 text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="••••••••"
                  />
                  <Lock className="w-5 h-5 text-zinc-500 absolute top-1/2 right-3 -translate-y-1/2" />
                </div>
              </div>

              {/* 2FA Toggle Switch */}
              <div className="md:col-span-2 flex items-center justify-between p-4 bg-[#161722]/50 border border-zinc-800/60 rounded-xl transition-all duration-200 hover:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">التحقق بخطوتين (2FA)</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">توفير طبقة أمان إضافية لحسابك عن طريق إرسال رمز تأكيد</p>
                  </div>
                </div>

                {/* Modern Direction-Agnostic Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleField('twoFactorEnabled')}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer relative focus:outline-none ${settings.twoFactorEnabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-700'
                    }`}
                >
                  <span
                    className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.twoFactorEnabled ? 'translate-x-[-22px]' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Notifications Card */}
          <div className="bg-[#12131a]/90 border border-zinc-800/80 rounded-xl p-6 shadow-xl transition-all duration-300 hover:border-zinc-700/30 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">إشعارات النظام والتنبيهات</h2>
            </div>

            <div className="space-y-4">
              {/* Email Alerts */}
              <div className="flex items-center justify-between p-4 bg-[#161722]/50 border border-zinc-800/60 rounded-xl transition-all duration-200 hover:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">إشعارات البريد الإلكتروني</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">تلقي تقارير الأداء وتنبيهات الأمان عبر البريد</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleField('emailAlerts')}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer relative focus:outline-none ${settings.emailAlerts ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-700'
                    }`}
                >
                  <span
                    className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.emailAlerts ? 'translate-x-[-22px]' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* In-App Alerts */}
              <div className="flex items-center justify-between p-4 bg-[#161722]/50 border border-zinc-800/60 rounded-xl transition-all duration-200 hover:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">التنبيهات الفورية داخل النظام</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">ظهور إشعارات منبثقة فورية عند حدوث نشاطات جديدة</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleField('inAppAlerts')}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer relative focus:outline-none ${settings.inAppAlerts ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-700'
                    }`}
                >
                  <span
                    className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.inAppAlerts ? 'translate-x-[-22px]' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Action Area */}
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

export default Settings;
