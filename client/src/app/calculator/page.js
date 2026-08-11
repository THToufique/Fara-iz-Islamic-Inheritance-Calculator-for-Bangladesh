'use client';
// app/calculator/page.js
// Inheritance calculator form page with land area support
// Tested: form submits correctly, land unit selector works ✓

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculatorAPI } from '../../lib/api';

const LAND_UNITS = [
  { value: 'decimal', label: 'Decimal', hint: '1 Katha = 1.65 Decimal, 1 Bigha = 33 Decimal' },
  { value: 'katha', label: 'Katha', hint: '1 Bigha = 20 Katha, 1 Katha = 1.65 Decimal' },
  { value: 'bigha', label: 'Bigha', hint: '1 Bigha = 20 Katha = 33 Decimal' },
];

export default function CalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    estateValue: '',
    landArea: '',
    landUnit: 'decimal',
    deceasedGender: 'male',
    numWives: '1',
    husbandAlive: 'yes',
    numSons: '0',
    numDaughters: '0',
    fatherAlive: 'no',
    motherAlive: 'no',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.estateValue && !form.landArea) {
      setError('Please enter at least an estate value or land area.');
      return;
    }
    if (form.estateValue && parseFloat(form.estateValue) <= 0) {
      setError('Estate value must be greater than 0.');
      return;
    }
    if (form.landArea && parseFloat(form.landArea) <= 0) {
      setError('Land area must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        estateValue: parseFloat(form.estateValue) || 0,
        landArea: parseFloat(form.landArea) || 0,
        landUnit: form.landUnit,
        deceasedGender: form.deceasedGender,
        numWives: form.deceasedGender === 'male' ? parseInt(form.numWives) : 0,
        husbandAlive: form.deceasedGender === 'female' ? form.husbandAlive === 'yes' : false,
        numSons: parseInt(form.numSons),
        numDaughters: parseInt(form.numDaughters),
        fatherAlive: form.fatherAlive === 'yes',
        motherAlive: form.motherAlive === 'yes',
      };
      const data = await calculatorAPI.calculate(payload);
      sessionStorage.setItem('faraiz_result', JSON.stringify(data.result));
      sessionStorage.setItem('faraiz_input', JSON.stringify(payload));
      router.push('/results');
    } catch (err) {
      setError(err.message || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedUnit = LAND_UNITS.find(u => u.value === form.landUnit);

  return (
    <div>
      <div className="page-header">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-serif font-bold text-teal-deep mb-3">
            Inheritance Share Calculator
          </h1>
          <p className="text-ink-soft max-w-2xl">
            Enter your estate details — money, land, or both — and surviving family members.
            The calculator covers spouse, children, and parents.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <form onSubmit={handleSubmit} className="md:col-span-3 card space-y-8">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Estate Details */}
            <div>
              <h3 className="font-serif font-bold text-teal-deep text-lg mb-4 pb-2 border-b border-gray-200">
                Estate Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Total estate value (BDT) — optional if land only</label>
                  <input
                    type="number"
                    name="estateValue"
                    value={form.estateValue}
                    onChange={handleChange}
                    placeholder="e.g. 5000000"
                    className="form-input"
                    min="0"
                  />
                  <p className="text-xs text-ink-soft mt-1">
                    Net value after deducting debts, funeral costs, and wasiyyah (up to 1/3).
                  </p>
                </div>

                {/* Land area */}
                <div>
                  <label className="form-label">Total land area — optional if money only</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      name="landArea"
                      value={form.landArea}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="form-input flex-1"
                      min="0"
                      step="0.01"
                    />
                    <select
                      name="landUnit"
                      value={form.landUnit}
                      onChange={handleChange}
                      className="form-input w-36"
                    >
                      {LAND_UNITS.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                  {selectedUnit && (
                    <p className="text-xs text-ink-soft mt-1">{selectedUnit.hint}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Gender of the deceased</label>
                  <div className="flex gap-6 mt-1">
                    {['male', 'female'].map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="deceasedGender"
                          value={g}
                          checked={form.deceasedGender === g}
                          onChange={handleChange}
                          className="accent-teal"
                        />
                        <span className="text-sm capitalize">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Surviving Spouse */}
            <div>
              <h3 className="font-serif font-bold text-teal-deep text-lg mb-4 pb-2 border-b border-gray-200">
                Surviving Spouse
              </h3>
              {form.deceasedGender === 'male' ? (
                <div>
                  <label className="form-label">Number of surviving wives</label>
                  <select name="numWives" value={form.numWives} onChange={handleChange} className="form-input">
                    {[0,1,2,3,4].map(n => (
                      <option key={n} value={n}>{n === 0 ? 'None' : n}</option>
                    ))}
                  </select>
                  <p className="text-xs text-ink-soft mt-1">
                    If more than one wife, the combined wife&apos;s share is split equally.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="form-label">Is the husband alive?</label>
                  <div className="flex gap-6 mt-1">
                    {['yes', 'no'].map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="husbandAlive"
                          value={v}
                          checked={form.husbandAlive === v}
                          onChange={handleChange}
                          className="accent-teal"
                        />
                        <span className="text-sm capitalize">{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Children */}
            <div>
              <h3 className="font-serif font-bold text-teal-deep text-lg mb-4 pb-2 border-b border-gray-200">
                Children
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Surviving sons</label>
                  <input type="number" name="numSons" value={form.numSons}
                    onChange={handleChange} min="0" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Surviving daughters</label>
                  <input type="number" name="numDaughters" value={form.numDaughters}
                    onChange={handleChange} min="0" className="form-input" />
                </div>
              </div>
            </div>

            {/* Parents */}
            <div>
              <h3 className="font-serif font-bold text-teal-deep text-lg mb-4 pb-2 border-b border-gray-200">
                Parents
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { name: 'fatherAlive', label: 'Is the father alive?' },
                  { name: 'motherAlive', label: 'Is the mother alive?' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="form-label">{field.label}</label>
                    <div className="flex gap-4 mt-1">
                      {['yes', 'no'].map(v => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={field.name}
                            value={v}
                            checked={form[field.name] === v}
                            onChange={handleChange}
                            className="accent-teal"
                          />
                          <span className="text-sm capitalize">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate Shares'}
            </button>
          </form>

          {/* Sidebar */}
          <aside className="md:col-span-2 space-y-5">
            <div className="bg-gold bg-opacity-10 border border-gold border-opacity-30 rounded-lg p-5">
              <h3 className="font-semibold text-teal-deep mb-2 text-sm">🌾 Land Unit Guide</h3>
              <div className="text-sm text-ink-soft space-y-1.5">
                <p><span className="font-semibold text-teal-deep">1 Bigha</span> = 20 Katha = 33 Decimal</p>
                <p><span className="font-semibold text-teal-deep">1 Katha</span> = 1.65 Decimal</p>
                <p><span className="font-semibold text-teal-deep">1 Decimal</span> = 435.6 sq ft</p>
              </div>
            </div>
            {[
              {
                title: "What's covered",
                items: [
                  'Money (BDT) — optional',
                  'Land area in Decimal/Katha/Bigha — optional',
                  'Surviving spouse(s)',
                  'Sons and daughters',
                  'Father and mother',
                ],
              },
              {
                title: 'Not yet covered',
                content: 'Grandparents, siblings, and more distant relatives are not included in this version.',
              },
              {
                title: 'A note on accuracy',
                content: 'This tool follows standard Sunni majority calculation rules. Always confirm with a qualified Islamic scholar before finalising any legal division.',
              },
            ].map((card, i) => (
              <div key={i} className="bg-sage rounded-lg p-5">
                <h3 className="font-semibold text-teal-deep mb-3 text-sm">{card.title}</h3>
                {card.items ? (
                  <ul className="space-y-1.5">
                    {card.items.map((item, j) => (
                      <li key={j} className="text-sm text-ink-soft flex gap-2">
                        <span className="text-teal mt-0.5">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-soft">{card.content}</p>
                )}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
