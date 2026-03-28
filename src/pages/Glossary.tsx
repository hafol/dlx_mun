import { motion } from 'motion/react';
import { Search, Book, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';

const glossaryTerms = [
  {
    term: "Abstain",
    definition: "When a delegate chooses not to vote on a draft resolution. This is usually done when a delegate's country doesn't have a strong position or wants to remain neutral."
  },
  {
    term: "Adjourn",
    definition: "To end a session or the entire conference. A motion to adjourn the session is usually made before lunch or at the end of the day."
  },
  {
    term: "Agenda",
    definition: "The order in which topics will be discussed in a committee. The committee must first vote on which topic to discuss first."
  },
  {
    term: "Amendment",
    definition: "A change to a draft resolution that has already been introduced. Amendments can be friendly (supported by all sponsors) or unfriendly (not supported by all sponsors, requires a vote)."
  },
  {
    term: "Caucus",
    definition: "A break in formal debate. There are two types: Moderated Caucus (formal discussion led by the Chair) and Unmoderated Caucus (informal discussion among delegates)."
  },
  {
    term: "Chair",
    definition: "The person who moderates the committee, ensures rules are followed, and keeps track of time and speakers."
  },
  {
    term: "Delegate",
    definition: "A student representing a country or organization in a Model UN committee."
  },
  {
    term: "Draft Resolution",
    definition: "A document that seeks to provide solutions to the topic being discussed. It must be written in a specific format with preambulatory and operative clauses."
  },
  {
    term: "General Speakers List (GSL)",
    definition: "The default state of debate where delegates speak on the general topic. Any delegate can be added to this list."
  },
  {
    term: "Motion",
    definition: "A formal proposal by a delegate to take a specific action, such as starting a caucus, moving to a vote, or adjourning the session."
  },
  {
    term: "Point of Order",
    definition: "Used when a delegate believes the Chair or another delegate has made a procedural error."
  },
  {
    term: "Point of Personal Privilege",
    definition: "Used when a delegate is experiencing discomfort that prevents them from participating (e.g., can't hear the speaker, room is too hot)."
  },
  {
    term: "Point of Inquiry / Parliamentary Inquiry",
    definition: "Used when a delegate has a question about the rules of procedure."
  },
  {
    term: "Quorum",
    definition: "The minimum number of delegates required to be present for the committee to conduct business."
  },
  {
    term: "Roll Call",
    definition: "The process of calling out the names of all countries in the committee to check attendance at the beginning of a session."
  },
  {
    term: "Sponsors",
    definition: "The main authors of a draft resolution who are responsible for its content."
  },
  {
    term: "Signatories",
    definition: "Delegates who wish to see a draft resolution debated, even if they don't necessarily support all its content."
  },
  {
    term: "Yield",
    definition: "When a delegate finishes their speech before their time is up, they can yield their remaining time to the Chair, to another delegate, or to questions."
  }
];

export default function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = glossaryTerms.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-container/10 mb-8 border border-primary-container/20">
            <Book className="text-primary-container" size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
            Model UN <span className="text-primary-container not-italic">Glossary</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-light max-w-2xl mx-auto">
            Master the language of international diplomacy. Your comprehensive guide to Model UN terminology and rules of procedure.
          </p>
        </motion.div>

        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface/30" size={24} />
          <input 
            type="text"
            placeholder="Search for a term or rule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-low border border-white/10 rounded-2xl pl-16 pr-8 py-6 text-xl focus:border-primary-container outline-none transition-all shadow-xl"
          />
        </div>

        <div className="space-y-4">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-surface-container-low p-8 rounded-2xl border border-white/5 hover:border-primary-container/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-container transition-colors">{item.term}</h3>
                    <p className="text-on-surface-variant font-light leading-relaxed">{item.definition}</p>
                  </div>
                  <div className="p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                    <Info size={20} className="text-primary-container" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-white/10">
              <p className="text-on-surface-variant">No terms found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        <section className="mt-24 p-12 bg-primary-container rounded-3xl text-on-primary-container relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase italic mb-4">Need more help?</h2>
            <p className="max-w-xl opacity-80 mb-8">
              Download our full Delegate Guide for a deep dive into resolution writing, research strategies, and advanced negotiation tactics.
            </p>
            <button className="px-8 py-4 bg-on-primary-container text-primary-container font-bold uppercase tracking-widest text-sm rounded-xl hover:scale-105 transition-all">
              Download Guide (PDF)
            </button>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 text-[15rem] font-black opacity-5 select-none pointer-events-none italic uppercase">
            MUN
          </div>
        </section>
      </div>
    </div>
  );
}
