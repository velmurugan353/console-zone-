import { useState } from 'react';
import { 
  Layout, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2,
  Globe,
  Clock,
  CheckCircle
} from 'lucide-react';

const banners = [
  { id: 1, title: 'PS5 Pro Launch', position: 'Home Hero', status: 'Active', updated: '2024-03-10', image: 'https://picsum.photos/seed/ps5pro/400/200' },
  { id: 2, title: 'Summer Sale 2024', position: 'Shop Sidebar', status: 'Scheduled', updated: '2024-03-12', image: 'https://picsum.photos/seed/sale/400/200' },
];

const blogPosts = [
  { id: 1, title: 'Top 10 RPGs of 2024', author: 'Admin', category: 'Gaming', status: 'Published', views: '1.2k', date: '2024-03-14' },
  { id: 2, title: 'How to Clean Your Console', author: 'Tech Team', category: 'Maintenance', status: 'Draft', views: '0', date: '2024-03-15' },
  { id: 3, title: 'VR Gaming: The Future', author: 'Admin', category: 'Tech', status: 'Published', views: '856', date: '2024-03-08' },
];

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('banners');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400 mt-2">Manage banners, blog posts, and site content.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gaming-accent text-white rounded-xl hover:bg-[#9333EA] transition-colors shadow-lg shadow-gaming-accent/20">
          <Plus className="h-4 w-4" />
          <span>Create New</span>
        </button>
      </div>

      <div className="flex space-x-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'banners' ? 'text-gaming-accent' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span>Banners & Media</span>
          </div>
          {activeTab === 'banners' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gaming-accent" />}
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'blog' ? 'text-gaming-accent' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Blog Posts</span>
          </div>
          {activeTab === 'blog' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gaming-accent" />}
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'pages' ? 'text-gaming-accent' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Static Pages</span>
          </div>
          {activeTab === 'pages' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gaming-accent" />}
        </button>
      </div>

      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                    banner.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {banner.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{banner.position}</p>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Last updated: {banner.updated}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-red-500/5 text-red-500/50 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 hover:border-gaming-accent/50 hover:bg-gaming-accent/5 transition-all group">
            <div className="p-4 bg-white/5 rounded-full group-hover:bg-gaming-accent/10 transition-colors mb-4">
              <Plus className="h-8 w-8 text-gray-500 group-hover:text-gaming-accent" />
            </div>
            <span className="text-gray-400 font-medium group-hover:text-white">Add New Banner</span>
          </button>
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-white/5 text-gray-200 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blogPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{post.title}</span>
                        <span className="text-xs text-gray-500">by {post.author}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {post.status === 'Published' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className={post.status === 'Published' ? 'text-green-400' : 'text-yellow-400'}>
                          {post.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">{post.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors">
                          <Globe className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

