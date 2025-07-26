'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, DollarSign, Users, Star } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/supabase';
import { SubscriptionEditModal } from './subscription-edit-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

export function SubscriptionsView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const { addToast } = useToast();

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      } else {
        addToast('Failed to load subscription plans', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      addToast('Failed to load subscription plans', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = () => {
    setIsCreateMode(true);
    setEditingPlan(null);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setIsCreateMode(false);
    setEditingPlan(plan);
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${plan.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast('Subscription plan deleted successfully', 'success');
        fetchPlans();
      } else {
        addToast('Failed to delete subscription plan', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete subscription plan', 'error');
    }
    setDeletingPlan(null);
  };

  const handleSave = () => {
    fetchPlans();
    setEditingPlan(null);
    setIsCreateMode(false);
  };

  const formatFeatures = (features: unknown) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === 'object') return Object.values(features);
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage pricing plans and features</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            {/* Plan Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {plan.plan_name}
                </h3>
                {plan.plan_name === 'pro' && (
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-xs text-yellow-600">Popular</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingPlan(plan)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {plan.price_monthly === 0 ? 'Free' : `$${plan.price_monthly}`}
                </span>
                {plan.price_monthly !== 0 && (
                  <span className="text-gray-500">/month</span>
                )}
              </div>
            </div>

            {/* Max Applications */}
            {plan.max_applications && (
              <div className="mb-4 flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {plan.max_applications === -1 ? 'Unlimited' : plan.max_applications} applications
                </span>
              </div>
            )}

            {/* Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Features:</h4>
              <div className="space-y-1">
                {formatFeatures(plan.features).slice(0, 3).map((feature, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{typeof feature === 'string' ? feature : feature.name || 'Feature'}</span>
                  </div>
                ))}
                {formatFeatures(plan.features).length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{formatFeatures(plan.features).length - 3} more features
                  </div>
                )}
              </div>
            </div>

            {/* Created Date */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Created: {new Date(plan.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <DollarSign className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription plans</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first pricing plan.</p>
          <button
            onClick={handleCreate}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Your First Plan
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {(editingPlan || isCreateMode) && (
        <SubscriptionEditModal
          plan={editingPlan}
          isOpen={true}
          onClose={() => {
            setEditingPlan(null);
            setIsCreateMode(false);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deletingPlan && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Subscription Plan"
          message={`Are you sure you want to delete the "${deletingPlan.plan_name}" plan? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={() => handleDelete(deletingPlan)}
          onClose={() => setDeletingPlan(null)}
          variant="danger"
        />
      )}
    </div>
  );
}