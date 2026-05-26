import React, { useState } from 'react';
import { ReferenceItem } from '../types';
import { Paperclip, Link, FileText, Image, Trash2, Globe, Plus, Notebook } from 'lucide-react';
import { motion } from 'motion/react';

interface ReferenceListProps {
  references: ReferenceItem[];
  onAdd: (ref: Omit<ReferenceItem, 'id' | 'createdAt'>) => void;
  onRemove: (id: string) => void;
}

export const ReferenceList: React.FC<ReferenceListProps> = ({
  references = [],
  onAdd,
  onRemove
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refName, setRefName] = useState('');
  const [refType, setRefType] = useState<'link' | 'image' | 'pdf' | 'document' | 'note'>('link');
  const [refVal, setRefVal] = useState('');

  const typeIcons = {
    link: Link,
    image: Image,
    pdf: FileText,
    document: FileText,
    note: Notebook
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim()) return;

    onAdd({
      name: refName,
      type: refType,
      value: refVal || 'No value content provided'
    });

    // Reset Form
    setRefName('');
    setRefVal('');
    setShowAddForm(false);
  };

  const fileUploaderSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onAdd({
        name: file.name,
        type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'document',
        value: reader.result as string // Base64 representation! Standard SaaS upload fallback!
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-black font-sans text-slate-100 uppercase tracking-wider">References & Resources</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-[11px] font-mono text-amber-500 hover:text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-colors duration-200"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Attach</span>
        </button>
      </div>

      {/* Add Reference Form Overlay */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-950/80 rounded-xl border border-slate-900/80 flex flex-col gap-3.5"
          onSubmit={handleFormSubmit}
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Resource Label</label>
            <input
              type="text"
              required
              value={refName}
              onChange={(e) => setRefName(e.target.value)}
              placeholder="e.g. Magic Spell Chart, Character Bio"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Resource Category</label>
              <select
                value={refType}
                onChange={(e: any) => setRefType(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="link">Website Link</option>
                <option value="note">Concept Note</option>
                <option value="document">Document Outline</option>
              </select>
            </div>
            
            {/* Quick File Attach Sim */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase font-black">Upload Attachment</label>
              <label className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/30 text-xs text-slate-400 hover:text-amber-400 text-center cursor-pointer transition-colors block">
                <span>Select local file</span>
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx,.txt"
                  onChange={fileUploaderSim}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase font-black">
              {refType === 'link' ? 'URL Location' : 'Document Outline Notes'}
            </label>
            <textarea
              required={refType !== 'document'}
              value={refVal}
              onChange={(e) => setRefVal(e.target.value)}
              placeholder={refType === 'link' ? 'https://my-wikipedia-reference.org' : 'Type or paste research snippets...'}
              rows={3}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-bold rounded-lg text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow-sm"
            >
              Save Link
            </button>
          </div>
        </motion.form>
      )}

      {/* References Display list */}
      <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
        {references.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-slate-900/60 rounded-xl">
            <Globe className="h-6 w-6 text-slate-700 mx-auto animate-bounce mb-2" />
            <p className="text-xs text-slate-500">No attached wiki articles, magic systems, or character sheets.</p>
          </div>
        ) : (
          references.map((item) => {
            const Icon = typeIcons[item.type] || Globe;
            const isBase64 = item.value.startsWith('data:');

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-900/80 hover:border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8.5 w-8.5 rounded-lg bg-slate-900/80 flex items-center justify-center border border-slate-800">
                    <Icon className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                      {item.type.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Open Link or View Note */}
                  {item.type === 'link' ? (
                    <a
                      href={item.value.startsWith('http') ? item.value : `https://${item.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                      title="Open external location link"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  ) : isBase64 ? (
                    <a
                      href={item.value}
                      download={item.name}
                      className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-amber-500 transition-colors font-mono text-[9px] font-bold"
                      title="Download attached object data"
                    >
                      View
                    </a>
                  ) : (
                    <button
                      onClick={() => alert(`Research Note snippets:\n\n${item.value}`)}
                      className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-amber-500 transition-colors text-[9px] font-mono font-bold"
                      title="Peek Note Content"
                    >
                      Peek
                    </button>
                  )}
                  
                  {/* Delete referencing element */}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove index attachment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
