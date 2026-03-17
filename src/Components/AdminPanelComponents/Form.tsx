import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface Errors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

const PasswordChangeForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validatePassword = (password: string): PasswordValidation => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.currentPassword === formData.newPassword && formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('Password changed successfully!');
      
    } catch (error) {
      setErrors({ submit: 'Failed to change password. Please try again.' });
      console.log(error)
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordValidation = validatePassword(formData.newPassword);

  const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
      {text}
    </div>
  );

  interface PasswordInputProps {
    label: string;
    name: keyof FormData;
    value: string;
    showPassword: boolean;
    onToggle: () => void;
    error?: string;
    placeholder: string;
  }

  const PasswordInput: React.FC<PasswordInputProps> = ({ 
    label, 
    name, 
    value, 
    showPassword, 
    onToggle, 
    error, 
    placeholder 
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );

  const isFormValid = passwordValidation.isValid && 
                     formData.currentPassword && 
                     formData.newPassword === formData.confirmPassword;

  return (
    <div className="max-w-md">
        
      <div className="space-y-1">
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={formData.currentPassword}
          showPassword={showPasswords.current}
          onToggle={() => togglePasswordVisibility('current')}
          error={errors.currentPassword}
          placeholder="Enter your current password"
        />

        <PasswordInput
          label="New Password"
          name="newPassword"
          value={formData.newPassword}
          showPassword={showPasswords.new}
          onToggle={() => togglePasswordVisibility('new')}
          error={errors.newPassword}
          placeholder="Enter your new password"
        />

        {formData.newPassword && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <div className="space-y-1">
              <PasswordRequirement met={passwordValidation.minLength} text="At least 8 characters" />
              <PasswordRequirement met={passwordValidation.hasUpper} text="One uppercase letter" />
              <PasswordRequirement met={passwordValidation.hasLower} text="One lowercase letter" />
              <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
              <PasswordRequirement met={passwordValidation.hasSpecial} text="One special character" />
            </div>
          </div>
        )}

        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          showPassword={showPasswords.confirm}
          onToggle={() => togglePasswordVisibility('confirm')}
          error={errors.confirmPassword}
          placeholder="Confirm your new password"
        />

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm flex items-center">
              <Check className="w-4 h-4 mr-2" />
              {successMessage}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isSubmitting || !isFormValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
};

export default PasswordChangeForm;