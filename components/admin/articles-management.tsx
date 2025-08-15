'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, FileText } from 'lucide-react';
import { getAllArticles, createArticle, updateArticle, deleteArticle, Article } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';
import dynamic from 'next/dynamic';

const EditorFallback = () => (
  <div className="border border-gray-300 rounded p-4 min-h-[200px] text-gray-500">
    Editor failed to load. Please refresh the page.
  </div>
);

const EditorLoading = () => (
  <div className="border border-gray-300 rounded p-4 min-h-[200px] animate-pulse bg-gray-50">
    Loading editor...
  </div>
);

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default).catch((error) => {
    console.error('Failed to load MDEditor:', error);
    return EditorFallback;
  }),
  { 
    ssr: false,
    loading: EditorLoading
  }
);

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
}

export function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    content: ''
  });
  const { addToast } = useToast();

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllArticles();
      setArticles(data);
    } catch {
      addToast('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const resetForm = () => {
    setFormData({ title: '', slug: '', content: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({ title: '', slug: '', content: '' });
  };

  const handleEdit = (article: Article) => {
    setIsCreating(false);
    setEditingId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      if (isCreating) {
        const result = await createArticle(formData);
        if (result.success) {
          addToast('Article created successfully', 'success');
          loadArticles();
          resetForm();
        } else {
          addToast(result.error || 'Failed to create article', 'error');
        }
      } else if (editingId) {
        const result = await updateArticle(editingId, formData);
        if (result.success) {
          addToast('Article updated successfully', 'success');
          loadArticles();
          resetForm();
        } else {
          addToast(result.error || 'Failed to update article', 'error');
        }
      }
    } catch {
      addToast('An error occurred', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const result = await deleteArticle(id);
      if (result.success) {
        addToast('Article deleted successfully', 'success');
        loadArticles();
      } else {
        addToast(result.error || 'Failed to delete article', 'error');
      }
    } catch {
      addToast('An error occurred', 'error');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Articles Management</h1>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isCreating || editingId !== null}
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isCreating ? 'Create New Article' : 'Edit Article'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Article title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="article-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (Markdown)
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <MDEditor
                value={formData.content}
                onChange={(val) => setFormData(prev => ({ ...prev, content: val || '' }))}
                preview="edit"
                height={400}
                data-color-mode="light"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isCreating ? 'Create' : 'Update'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Articles ({articles.length})
          </h2>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No articles found. Create your first article to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {articles.map((article) => (
              <div key={article.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Slug: <code className="bg-gray-100 px-1 rounded">{article.slug}</code>
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(article.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      disabled={isCreating || editingId !== null}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      disabled={isCreating || editingId !== null}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}