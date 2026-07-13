import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { registerMSME } from '../api/client';
import { INDIAN_STATES, BUSINESS_TYPES, INDUSTRIES, type MSMEFormData } from '../types';

const INITIAL: MSMEFormData = {
  business_name: '',
  gst_number: '',
  business_type: '',
  industry: '',
  state: '',
  city: '',
  employee_count: 0,
  annual_turnover: 0,
};

export default function RegisterMSME() {
  const navigate = useNavigate();
  const [form, setForm] = useState<MSMEFormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof MSMEFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const update = (field: keyof MSMEFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof MSMEFormData, string>> = {};
    if (!form.business_name.trim()) errs.business_name = 'Business name is required';
    if (!form.gst_number.trim()) errs.gst_number = 'GST number is required';
    else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst_number))
      errs.gst_number = 'Invalid GST number format';
    if (!form.business_type) errs.business_type = 'Business type is required';
    if (!form.industry) errs.industry = 'Industry is required';
    if (!form.state) errs.state = 'State is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (form.employee_count <= 0) errs.employee_count = 'Must be greater than 0';
    if (form.annual_turnover <= 0) errs.annual_turnover = 'Must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');

    try {
      await registerMSME(form);
      setSubmitSuccess(true);
      setTimeout(() => navigate('/assess'), 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center animate-fade-in">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Registration Successful!</h2>
        <p className="text-slate-400 mt-2">Redirecting to health assessment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Card className="text-center py-8">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
          <UserPlus size={28} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Register New MSME</h1>
        <p className="text-slate-400 mt-2">Enter business details to register in the system</p>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Business Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              value={form.business_name}
              onChange={(e) => update('business_name', e.target.value)}
              placeholder="e.g. Sharma Textiles Pvt Ltd"
              error={errors.business_name}
            />
            <Input
              label="GST Number"
              value={form.gst_number}
              onChange={(e) => update('gst_number', e.target.value.toUpperCase())}
              placeholder="27AABCU9603R1ZM"
              error={errors.gst_number}
              maxLength={15}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Business Type"
              value={form.business_type}
              onChange={(e) => update('business_type', e.target.value)}
              options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Select type"
              error={errors.business_type}
            />
            <Select
              label="Industry"
              value={form.industry}
              onChange={(e) => update('industry', e.target.value)}
              options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
              placeholder="Select industry"
              error={errors.industry}
            />
          </div>

          <hr className="border-slate-800" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="State"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
              placeholder="Select state"
              error={errors.state}
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="e.g. Mumbai"
              error={errors.city}
            />
          </div>

          <hr className="border-slate-800" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Financial Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Employee Count"
              type="number"
              value={form.employee_count || ''}
              onChange={(e) => update('employee_count', parseInt(e.target.value) || 0)}
              placeholder="e.g. 50"
              error={errors.employee_count}
              min={1}
            />
            <Input
              label="Annual Turnover (INR)"
              type="number"
              value={form.annual_turnover || ''}
              onChange={(e) => update('annual_turnover', parseInt(e.target.value) || 0)}
              placeholder="e.g. 5000000"
              error={errors.annual_turnover}
              min={1}
            />
          </div>

          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertCircle size={16} className="text-rose-400 mt-0.5" />
              <p className="text-sm text-rose-400">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Register MSME
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
