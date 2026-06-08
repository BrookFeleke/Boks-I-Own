/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaxonomyLists } from '../types';
import { PublisherNormalizer } from '../services/publisherNormalizer';
import { 
  Sliders, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Check, 
  BookMarked, 
  Settings, 
  Shuffle, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface TaxonomyPageProps {
  taxonomies: TaxonomyLists;
  onSaveTaxonomy: (key: keyof TaxonomyLists, newList: string[]) => void;
}

export const TaxonomyPage: React.FC<TaxonomyPageProps> = ({
  taxonomies,
  onSaveTaxonomy
}) => {
  // Navigation for active taxonomy list being edited
  const [activeKey, setActiveKey] = useState<keyof TaxonomyLists>('genres');
  const [newItem, setNewItem] = useState('');

  const lists: { id: keyof TaxonomyLists; name: string; color: string; desc: string }[] = [
    { id: 'genres', name: 'Genres & Tags', color: 'bg-[#FFD700]', desc: 'Classifications mapping cross-book styles' },
    { id: 'literaryPeriods', name: 'Literary Eras', color: 'bg-[#FF4500] text-white', desc: 'Epoch boundaries used to cluster collections chronologically' },
    { id: 'publishers', name: 'Canonical Publishers', color: 'bg-[#90EE90]', desc: 'Verified canonical publisher labels to merge redundant strings' },
    { id: 'workTypes', name: 'Work Type Forms', color: 'bg-orange-100', desc: 'Form specifications such as Novella, Play, or Philosophical Treatise' },
    { id: 'formats', name: 'Formats', color: 'bg-[#EBF5FB]', desc: 'Physical edition formats like Paperback or Hardback' },
    { id: 'conditions', name: 'Conditions', color: 'bg-[#FFF7E8]', desc: 'Archive conservation levels from Poor to Like New' }
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const currentList = taxonomies[activeKey];
    if (currentList.map(i => i.toLowerCase().trim()).includes(newItem.toLowerCase().trim())) {
      alert("This canonical parameter is already registered in the active metadata list.");
      return;
    }

    const updated = [...currentList, newItem.trim()];
    onSaveTaxonomy(activeKey, updated);
    setNewItem('');
  };

  const handleDeleteItem = (itemToDelete: string) => {
    // Basic guards
    if (activeKey === 'formats' && taxonomies.formats.length <= 1) {
      alert("Cannot delete last remaining physical format slot.");
      return;
    }
    if (activeKey === 'conditions' && taxonomies.conditions.length <= 1) {
      alert("Cannot delete last remaining conservation standard.");
      return;
    }

    if (confirm(`Are you sure you want to remove canonical option "${itemToDelete}"? Existing books mapped to this might lose categorization.`)) {
      const updated = taxonomies[activeKey].filter(item => item !== itemToDelete);
      onSaveTaxonomy(activeKey, updated);
    }
  };

  const activeMetadata = lists.find(l => l.id === activeKey)!;
  const activeItems = taxonomies[activeKey];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12 font-sans text-black animate-fade-in">
      
      {/* 1. Left Selection sidebar lists */}
      <div className="lg:col-span-1 space-y-6">
        <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
          <h3 className="text-sm font-mono font-black uppercase text-black border-b-4 border-black pb-2 mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-black stroke-[3]" />
            LOOKUP INDEXES (TAXONOMY)
          </h3>

          <div className="space-y-3">
            {lists.map((l) => {
              const isActive = activeKey === l.id;
              return (
                <button
                  key={l.id}
                  id={`tax-btn-${l.id}`}
                  onClick={() => setActiveKey(l.id)}
                  className={`w-full text-left p-3 border-4 border-black font-mono text-xs font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] cursor-pointer hover:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all flex justify-between items-center rounded-none ${
                    isActive ? `${l.color} shadow-none translate-x-[1px] translate-y-[1px]` : 'bg-white hover:bg-[#FFF7E8]'
                  }`}
                >
                  <span>{l.name}</span>
                  <span className="text-[10px] font-mono font-black">[{taxonomies[l.id].length}]</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PERSISTENCE WARNING NOTICE */}
        <div className="bg-[#FFF7E8] border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-2 rounded-none">
          <div className="flex gap-2 text-black items-center">
            <AlertTriangle className="w-5 h-5 text-[#FF4500] stroke-[3]" />
            <h4 className="font-mono text-xs font-black uppercase tracking-tight">DEMO SANDBOX DATABASE MODE</h4>
          </div>
          <p className="text-[11px] font-bold leading-normal text-black font-mono">
            Changes are stored locally in this browser cache via LocalStorage. Resets will load presets.
          </p>
        </div>
      </div>

      {/* 2. Main Editing Panel Area */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Editing Grid Sheet Card */}
        <div className="border-4 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-6 rounded-none">
          <div className="border-b-4 border-black pb-3">
            <span className="font-mono text-[9px] font-black uppercase tracking-wider text-black bg-[#FFD700] border-2 border-black py-1 px-2.5 rounded-none">
              Lookup Module ID: {activeMetadata.id}
            </span>
            <h2 className="text-2xl font-black uppercase italic mt-4 leading-none text-black">
              MODIFY CANONICAL: {activeMetadata.name}
            </h2>
            <p className="text-xs text-black font-bold uppercase font-mono mt-2 tracking-tight">
              {activeMetadata.desc}. Add options to enrich dropdown forms or delete deprecated items.
            </p>
          </div>

          {/* Quick Addition Input Box */}
          <form onSubmit={handleAddItem} className="bg-[#FFF7E8] border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex gap-2 rounded-none">
            <input
              id="tax-add-input"
              type="text"
              required
              placeholder={`Enter new lookup ${activeMetadata.name.toLowerCase()} value...`}
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              className="flex-grow bg-white border-4 border-black p-2.5 font-sans text-xs font-black focus:outline-none"
            />
            <button
              id="tax-add-submit"
              type="submit"
              className="bg-[#90EE90] hover:bg-black hover:text-white font-mono text-xs font-black uppercase tracking-widest text-black py-2.5 px-5 border-4 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer rounded-none transition-all duration-100"
            >
              <Plus className="w-4 h-4 stroke-[3] inline mr-1" />
              Register Item
            </button>
          </form>

          {/* List parameters grid */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] font-black text-black uppercase tracking-widest px-1">
              Active registered parameters list ({activeItems.length} items logged)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeItems.map((item) => (
                <div 
                  key={item} 
                  className="bg-white border-4 border-black p-3.5 flex justify-between items-center shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#FFF7E8] rounded-none text-black"
                >
                  <strong className="text-xs font-black truncate">{item}</strong>
                  <button
                    type="button"
                    title={`Delete lookup option "${item}"`}
                    onClick={() => handleDeleteItem(item)}
                    className="text-[#FF4500] hover:bg-black hover:text-white p-1 rounded-none border border-transparent hover:border-black active:translate-y-0.5 cursor-pointer transition-all duration-100"
                  >
                    <Trash2 className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Publisher normalizer configuration documentation (Extra widget) */}
        {activeKey === 'publishers' && (
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-4 rounded-none">
            <h3 className="text-lg font-black uppercase italic text-black border-b-4 border-black pb-2 mb-2 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-[#FF4500] stroke-[3]" />
              Active System Mappings Rulebook
            </h3>
            <p className="text-xs text-black font-bold font-mono uppercase tracking-tight">
              The normalizer consolidates multiple messy library entries into clean, normalized publishers list using preconfigured regex patterns on ingestion.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {PublisherNormalizer.getCommonMappings().map((rule, idx) => (
                <div key={idx} className="bg-[#FFF7E8] border-2 border-black p-3 text-xs flex justify-between items-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-none">
                  <div className="truncate flex-grow mr-2">
                    <span className="block font-mono text-[9px] text-[#FF4500] uppercase leading-none font-black">RAW / SOURCE EXPRESSION:</span>
                    <strong className="text-[10px] text-gray-800 font-mono font-black line-through truncate block mt-1">{rule.input}</strong>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black shrink-0 mx-1 stroke-[3]" />
                  <div className="truncate text-right ml-2 shrink-0 max-w-[120px]">
                    <span className="block font-mono text-[9px] text-black uppercase leading-none font-black">CANONICAL MERGE:</span>
                    <strong className="text-[10px] text-[#FF4500] font-black block mt-1 bg-white border-2 border-black px-1.5 py-0.5 rounded-none font-mono">{rule.output}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
