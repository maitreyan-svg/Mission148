import React, { useState } from 'react';
import { 
  FileCheck2, 
  Plus, 
  Trash2, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { MockTest } from '../types';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';

export const MockTestView: React.FC = () => {
  const { user } = useAuth();
  const { mockTests, addMockTest, deleteMockTest } = useMission();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [testName, setTestName] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [examType, setExamType] = useState<'jee_main' | 'jee_advanced'>('jee_main');
  const [physicsScore, setPhysicsScore] = useState<number>(75);
  const [chemistryScore, setChemistryScore] = useState<number>(80);
  const [mathScore, setMathScore] = useState<number>(65);
  const [percentile, setPercentile] = useState<number>(97.2);
  const [notes, setNotes] = useState<string>('');

  const targetPercentile = user?.targets.jeeMainPercentile || '96+';

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const totalScore = Number(physicsScore) + Number(chemistryScore) + Number(mathScore);
    const maxScore = examType === 'jee_main' ? 300 : 360;

    await addMockTest({
      testName: testName.trim(),
      date,
      examType,
      physicsScore: Number(physicsScore) || 0,
      chemistryScore: Number(chemistryScore) || 0,
      mathScore: Number(mathScore) || 0,
      totalScore,
      maxScore,
      percentile: examType === 'jee_main' ? Number(percentile) : undefined,
      notes: notes.trim(),
    });

    setTestName('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div id="mock-tests-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              MOCK TEST TRACKER
            </h2>
            <p className="text-xs text-amber-400 font-mono">
              Target Reference: {targetPercentile} Percentile in JEE Main
            </p>
          </div>
        </div>

        <button
          id="btn-add-mock-test"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ LOG MOCK TEST</span>
        </button>
      </div>

      {/* Target Notice Box */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400 font-mono">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200">Personal Evaluation Metric:</span> Track your simulated test series scores, percentile trajectory, and subject-wise accuracy. Note: Mock tests serve as practice feedback and do not claim to predict actual JEE exam outcomes.
        </div>
      </div>

      {/* Mock Tests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTests.map((test) => (
          <div
            key={test.id}
            id={`mock-card-${test.id}`}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                    test.examType === 'jee_main'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  }`}>
                    {test.examType === 'jee_main' ? 'JEE MAIN MOCK' : 'JEE ADVANCED MOCK'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{test.date}</span>
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1.5 capitalize">
                  {test.testName}
                </h4>
              </div>

              <button
                onClick={() => deleteMockTest(test.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-cyan-400">Physics</div>
                <div className="text-sm font-bold text-white mt-0.5">{test.physicsScore}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-emerald-400">Chem</div>
                <div className="text-sm font-bold text-white mt-0.5">{test.chemistryScore}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-amber-400">Math</div>
                <div className="text-sm font-bold text-white mt-0.5">{test.mathScore}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-white">Total</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {test.totalScore} <span className="text-[10px] text-slate-500">/{test.maxScore}</span>
                </div>
              </div>
            </div>

            {/* Percentile Pill */}
            {test.percentile !== undefined && (
              <div className="mt-3 flex items-center justify-between text-xs font-mono p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400">Calculated Percentile:</span>
                <span className="font-bold text-amber-400">{test.percentile}%ile</span>
              </div>
            )}

            {test.notes && (
              <p className="text-xs text-slate-400 mt-3 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                "{test.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {mockTests.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Mock Tests Logged</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log your full-length or part-syllabus mock tests to track your scores against your 96+ percentile target.
          </p>
        </div>
      )}

      {/* Add Mock Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white">Log Mock Test</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTest} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Test Name</label>
                <input
                  type="text"
                  placeholder="e.g. Allen Major Test 1, FIITJEE AITS 2..."
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  >
                    <option value="jee_main">JEE Main (/300)</option>
                    <option value="jee_advanced">JEE Advanced (/360)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Test Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-cyan-400 mb-1">Physics Score</label>
                  <input
                    type="number"
                    value={physicsScore}
                    onChange={(e) => setPhysicsScore(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-emerald-400 mb-1">Chem Score</label>
                  <input
                    type="number"
                    value={chemistryScore}
                    onChange={(e) => setChemistryScore(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-amber-400 mb-1">Math Score</label>
                  <input
                    type="number"
                    value={mathScore}
                    onChange={(e) => setMathScore(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {examType === 'jee_main' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Percentile</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={percentile}
                    onChange={(e) => setPercentile(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Notes / Weak Areas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key mistakes or topics to revise..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Save Mock Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
