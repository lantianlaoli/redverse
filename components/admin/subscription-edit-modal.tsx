'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';

interface SubscriptionEditModalProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SubscriptionEditModal({ plan, isOpen, onClose, onSave }: SubscriptionEditModalProps) {
  const [formData, setFormData] = useState({
    plan_name: '',
    price_monthly: 0,
    max_applications: 1,
    features: [] as string[]
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name || '',
        price_monthly: Number(plan.price_monthly) || 0,
        max_applications: plan.max_applications || 1,
        features: formatFeatures(plan.features)
      });
    } else {
      setFormData({
        plan_name: '',
        price_monthly: 0,
        max_applications: 1,
        features: []
      });
    }
  }, [plan]);

  const formatFeatures = (features: unknown): string[] => {
    if (!features) return [];
    if (Array.isArray(features)) {
      return features.map(f => typeof f === 'string' ? f : f.name || '');
    }
    if (typeof features === 'object') {
      return Object.values(features).map(f => String(f));
    }
    return [];
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plan_name.trim()) {
      addToast('Plan name is required', 'error');
      return;
    }

    if (formData.price_monthly < 0) {
      addToast('Price cannot be negative', 'error');
      return;
    }

    if (formData.max_applications < 1 && formData.max_applications !== -1) {
      addToast('Max applications must be at least 1 or -1 for unlimited', 'error');
      return;
    }

    const filteredFeatures = formData.features.filter(f => f.trim());

    setSaving(true);
    try {
      const url = plan ? `/api/admin/subscriptions/${plan.id}` : '/api/admin/subscriptions';
      const method = plan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_name: formData.plan_name.trim(),
          price_monthly: formData.price_monthly,
          max_applications: formData.max_applications,
          features: filteredFeatures
        }),
      });

      if (response.ok) {
        addToast(
          plan ? 'Subscription plan updated successfully' : 'Subscription plan created successfully',
          'success'
        );
        onSave();
      } else {
        const error = await response.json();
        addToast(error.error || 'Failed to save subscription plan', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      addToast('Failed to save subscription plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border border-gray-200 max-w-2xl shadow-xl rounded-xl bg-white/90 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {plan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              value={formData.plan_name}
              onChange={(e) => handleInputChange('plan_name', e.target.value)}
              placeholder="e.g., basic, pro, enterprise"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Monthly Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price_monthly}
              onChange={(e) => handleInputChange('price_monthly', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <p className="text-xs text-gray-600 mt-1">Set to 0 for free plans</p>
          </div>

          {/* Max Applications */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Max Applications
            </label>
            <input
              type="number"
              min="-1"
              value={formData.max_applications}
              onChange={(e) => handleInputChange('max_applications', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <p className="text-xs text-gray-600 mt-1">Set to -1 for unlimited applications</p>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Features
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add Feature</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Feature description"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {formData.features.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No features added yet</p>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add your first feature
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}