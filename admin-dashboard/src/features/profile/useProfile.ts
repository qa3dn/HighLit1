import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

export interface ProfileFields {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  languages: string[];
}

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/></svg>`;

const INITIAL_PROFILE: ProfileFields = {
  fullName: 'مصطفى أبو عبيدة',
  email: 'mustafa@highlit.jo',
  phone: '+962 7 9123 4567',
  role: 'مدير النظام / المشرف العام',
  bio: 'مطور ومصمم تجربة مستخدم متخصص في تطوير المنصات والحلول التقنية الرقمية في الأردن.',
  avatarUrl: DEFAULT_AVATAR,
  skills: ['React', 'Tailwind CSS', 'TypeScript'],
  languages: ['العربية', 'الإنجليزية'],
};

export const useProfile = () => {
  const { userName, userEmail, userAvatar, updateUser } = useUser();

  const [profile, setProfile] = useState<ProfileFields>({
    ...INITIAL_PROFILE,
    fullName: userName,
    email: userEmail,
    avatarUrl: userAvatar || DEFAULT_AVATAR,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with global user context
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      fullName: userName,
      email: userEmail,
      avatarUrl: userAvatar || DEFAULT_AVATAR,
    }));
  }, [userName, userEmail, userAvatar]);

  // Update text/textarea inputs
  const updateField = <K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (saveSuccess) setSaveSuccess(false);
    if (error) setError(null);
  };

  // Add/remove skills handlers
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      if (saveSuccess) setSaveSuccess(false);
      if (error) setError(null);
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
    if (saveSuccess) setSaveSuccess(false);
    if (error) setError(null);
  };

  // Add/remove languages handlers
  const addLanguage = (lang: string) => {
    const trimmed = lang.trim();
    if (trimmed && !profile.languages.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        languages: [...prev.languages, trimmed],
      }));
      if (saveSuccess) setSaveSuccess(false);
      if (error) setError(null);
    }
  };

  const removeLanguage = (lang: string) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
    if (saveSuccess) setSaveSuccess(false);
    if (error) setError(null);
  };

  // Convert uploaded image to Base64 so it can be previewed in real-time
  const handleAvatarChange = (file: File) => {
    if (!file) return;

    // Type validation
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (PNG, JPG, SVG).');
      return;
    }

    // Size check (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateField('avatarUrl', e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile state simulation
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Input Validation
      if (profile.fullName.trim().length < 3) {
        throw new Error('الاسم الكامل يجب أن يكون 3 حروف على الأقل.');
      }
      
      const phoneRegex = /^\+?[0-9\s\-()]{7,18}$/;
      if (!phoneRegex.test(profile.phone)) {
        throw new Error('يرجى إدخال رقم هاتف صالح.');
      }

      // Simulate API saving latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Update global user context state
      updateUser(
        profile.fullName,
        profile.email,
        profile.avatarUrl === DEFAULT_AVATAR ? '' : profile.avatarUrl
      );

      setSaveSuccess(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الملف الشخصي.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset profile state
  const handleCancel = () => {
    setProfile({
      ...INITIAL_PROFILE,
      fullName: userName,
      email: userEmail,
      avatarUrl: userAvatar || DEFAULT_AVATAR,
    });
    setSaveSuccess(false);
    setError(null);
  };

  return {
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
  };
};
