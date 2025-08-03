export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateField = (
  value: string,
  rules: ValidationRule,
  fieldName: string,
  t: (key: string) => string
): string | null => {
  if (rules.required && (!value || value.trim() === '')) {
    return t('required');
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    if (fieldName === 'password') {
      return t('passwordTooShort');
    }
    return `Minimum ${rules.minLength} characters required`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    if (fieldName === 'email') {
      return t('invalidEmail');
    }
    if (fieldName === 'phoneNumber') {
      return t('invalidPhone');
    }
    return 'Invalid format';
  }

  if (value && rules.custom && !rules.custom(value)) {
    return 'Invalid value';
  }

  return null;
};

export const validateForm = (
  formData: Record<string, string>,
  validationRules: Record<string, ValidationRule>,
  t: (key: string) => string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach(field => {
    const error = validateField(formData[field] || '', validationRules[field], field, t);
    if (error) {
      errors[field] = error;
    }
  });

  // Custom validation for password confirmation
  if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = t('passwordsNotMatch');
  }

  return errors;
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;