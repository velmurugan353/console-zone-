import React, { useState, useEffect } from 'react';
import { useCustomizer } from '../context/CustomizerContext';
import { Edit2, Check, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

interface EditableTextProps {
  pageKey: string;
  itemKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({
  pageKey,
  itemKey,
  defaultText,
  className = '',
  as: Component = 'span'
}) => {
  const { content, isEditMode, updateContent } = useCustomizer();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content[pageKey]?.[itemKey] || defaultText);

  useEffect(() => {
    setValue(content[pageKey]?.[itemKey] || defaultText);
  }, [content, pageKey, itemKey, defaultText]);

  const handleSave = () => {
    updateContent(pageKey, itemKey, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(content[pageKey]?.[itemKey] || defaultText);
    setIsEditing(false);
  };

  if (!isEditMode) {
    return <Component className={className}>{content[pageKey]?.[itemKey] || defaultText}</Component>;
  }

  if (isEditing) {
    return (
      <div className={`relative inline-block w-full group ${className}`}>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-black/50 border border-gaming-accent rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-gaming-accent"
          rows={value.split('\n').length}
          autoFocus
        />
        <div className="absolute top-full right-0 mt-1 flex space-x-1 z-50">
          <button onClick={handleSave} className="p-1 bg-green-500 text-white rounded shadow-lg hover:bg-green-600">
            <Check size={12} />
          </button>
          <button onClick={handleCancel} className="p-1 bg-red-500 text-white rounded shadow-lg hover:bg-red-600">
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group cursor-pointer border border-transparent hover:border-gaming-accent/50 rounded px-1 -mx-1 transition-all ${className}`} onClick={() => setIsEditing(true)}>
      <Component>{content[pageKey]?.[itemKey] || defaultText}</Component>
      <div className="absolute -top-3 -right-3 hidden group-hover:flex p-1 bg-gaming-accent text-white rounded-full shadow-lg">
        <Edit2 size={10} />
      </div>
    </div>
  );
};

interface EditableImageProps {
  pageKey: string;
  itemKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  pageKey,
  itemKey,
  defaultSrc,
  alt,
  className = ''
}) => {
  const { content, isEditMode, updateContent } = useCustomizer();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content[pageKey]?.[itemKey] || defaultSrc);

  useEffect(() => {
    setValue(content[pageKey]?.[itemKey] || defaultSrc);
  }, [content, pageKey, itemKey, defaultSrc]);

  const handleSave = () => {
    updateContent(pageKey, itemKey, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(content[pageKey]?.[itemKey] || defaultSrc);
    setIsEditing(false);
  };

  if (!isEditMode) {
    return <img src={content[pageKey]?.[itemKey] || defaultSrc} alt={alt} className={className} />;
  }

  if (isEditing) {
    return (
      <div className={`relative ${className} border-2 border-gaming-accent rounded-lg p-2 bg-black/80 flex flex-col items-center justify-center space-y-4 z-40`}>
        <div className="w-full">
          <label className="block text-[10px] uppercase font-bold text-gaming-accent mb-1">Image URL</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none"
            placeholder="https://..."
            autoFocus
          />
        </div>
        <div className="flex space-x-2">
          <button onClick={handleSave} className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded hover:bg-green-600 flex items-center space-x-1">
            <Check size={10} /> <span>Save</span>
          </button>
          <button onClick={handleCancel} className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 flex items-center space-x-1">
            <X size={10} /> <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group cursor-pointer overflow-hidden ${className}`} onClick={() => setIsEditing(true)}>
      <img src={content[pageKey]?.[itemKey] || defaultSrc} alt={alt} className="w-full h-full object-cover transition-all group-hover:scale-105 group-hover:opacity-80" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        <div className="p-3 bg-gaming-accent text-white rounded-full shadow-2xl">
          <ImageIcon size={24} />
        </div>
      </div>
      <div className="absolute top-2 right-2 p-1 bg-gaming-accent text-white rounded-full shadow-lg">
        <Edit2 size={12} />
      </div>
    </div>
  );
};

interface EditableListProps {
  pageKey: string;
  itemKey: string;
  defaultList: string[];
  className?: string;
  renderItem?: (item: string, index: number) => React.ReactNode;
  listContainerClassName?: string;
}

export const EditableList: React.FC<EditableListProps> = ({
  pageKey,
  itemKey,
  defaultList,
  className = '',
  renderItem,
  listContainerClassName = ''
}) => {
  const { content, isEditMode, updateContent } = useCustomizer();
  const [isEditing, setIsEditing] = useState(false);
  const currentList = content[pageKey]?.[itemKey] as string[] || defaultList;
  const [items, setItems] = useState<string[]>(currentList);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    setItems(content[pageKey]?.[itemKey] || defaultList);
  }, [content, pageKey, itemKey, defaultList]);

  const handleSave = () => {
    updateContent(pageKey, itemKey, items);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setItems(content[pageKey]?.[itemKey] || defaultList);
    setIsEditing(false);
  };

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  if (!isEditMode) {
    return (
      <div className={listContainerClassName}>
        {currentList.map((item, index) => renderItem ? renderItem(item, index) : <span key={index}>{item}</span>)}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`relative w-full p-4 border-2 border-gaming-accent rounded-xl bg-black/80 z-40 ${className}`}>
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
          <label className="text-[10px] uppercase font-bold text-gaming-accent">Edit List Items</label>
          <div className="flex space-x-2">
            <button onClick={handleSave} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Save Changes">
              <Check size={14} />
            </button>
            <button onClick={handleCancel} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" title="Cancel">
              <X size={14} />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = e.target.value;
                  setItems(newItems);
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-gaming-accent"
              />
              <button onClick={() => removeItem(index)} className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add new item..."
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-gaming-accent"
          />
          <button onClick={addItem} className="px-4 py-2 bg-gaming-accent text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-[#9333ea] transition-colors flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group cursor-pointer border border-transparent hover:border-gaming-accent/50 rounded-xl transition-all ${className}`} onClick={() => setIsEditing(true)}>
      <div className={listContainerClassName}>
        {currentList.map((item, index) => renderItem ? renderItem(item, index) : <span key={index}>{item}</span>)}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-4 py-2 bg-gaming-accent text-black font-black uppercase tracking-widest text-xs rounded-full shadow-[0_0_20px_rgba(216, 102, 255,0.6)] z-10">
        <Edit2 size={14} /> Edit List
      </div>
      <div className="absolute inset-0 bg-black/40 hidden group-hover:block rounded-xl transition-opacity"></div>
    </div>
  );
};
