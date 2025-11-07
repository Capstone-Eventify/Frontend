'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit2, Save, X, Grid, Layout, Columns } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface Seat {
  id: string
  row: string
  number: string
  section: string
  isAvailable: boolean
}

export interface SeatingSection {
  id: string
  name: string
  color: string
  rows: number
  seatsPerRow: number
  startingRow: string
}

export interface SeatingArrangement {
  sections: SeatingSection[]
  seats: Seat[]
}

interface SeatingArrangementBuilderProps {
  arrangement: SeatingArrangement | null
  onArrangementChange: (arrangement: SeatingArrangement) => void
}

const defaultColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function SeatingArrangementBuilder({
  arrangement,
  onArrangementChange
}: SeatingArrangementBuilderProps) {
  const [sections, setSections] = useState<SeatingSection[]>(
    arrangement?.sections || []
  )
  const [editingSection, setEditingSection] = useState<SeatingSection | null>(null)
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Update sections when arrangement changes from parent
  useEffect(() => {
    if (arrangement?.sections && arrangement.sections.length > 0) {
      setSections(arrangement.sections)
    } else if (!arrangement || !arrangement.sections || arrangement.sections.length === 0) {
      setSections([])
    }
  }, [arrangement])

  const addSection = () => {
    const newSection: SeatingSection = {
      id: `section_${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      color: defaultColors[sections.length % defaultColors.length],
      rows: 5,
      seatsPerRow: 10,
      startingRow: 'A'
    }
    setEditingSection(newSection)
    setShowSectionForm(true)
  }

  const saveSection = (section: SeatingSection) => {
    let updated: SeatingSection[]
    if (editingSection && sections.some(s => s.id === editingSection.id)) {
      // Update existing
      updated = sections.map(s => s.id === section.id ? section : s)
    } else {
      // Add new
      updated = [...sections, section]
    }
    setSections(updated)
    setShowSectionForm(false)
    setEditingSection(null)
    generateSeats(updated)
  }

  const deleteSection = (sectionId: string) => {
    const updated = sections.filter(s => s.id !== sectionId)
    setSections(updated)
    generateSeats(updated)
  }

  const generateSeats = (sectionsToUse: SeatingSection[]) => {
    const allSeats: Seat[] = []
    
    sectionsToUse.forEach(section => {
      const rowStart = section.startingRow.charCodeAt(0)
      for (let r = 0; r < section.rows; r++) {
        const rowLetter = String.fromCharCode(rowStart + r)
        for (let s = 1; s <= section.seatsPerRow; s++) {
          allSeats.push({
            id: `${section.id}_${rowLetter}_${s}`,
            row: rowLetter,
            number: s.toString(),
            section: section.id,
            isAvailable: true
          })
        }
      }
    })

    const newArrangement: SeatingArrangement = {
      sections: sectionsToUse,
      seats: allSeats
    }
    onArrangementChange(newArrangement)
  }

  const handleSectionUpdate = (section: SeatingSection) => {
    const updated = sections.map(s => s.id === section.id ? section : s)
    setSections(updated)
    generateSeats(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Seating Arrangement</h3>
          <p className="text-sm text-gray-600">Configure your venue's seating layout</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <Edit2 size={16} className="mr-2" /> : <Grid size={16} className="mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addSection}
          >
            <Plus size={16} className="mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Layout size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No seating sections configured</p>
          <Button onClick={addSection}>
            <Plus size={16} className="mr-2" />
            Create Your First Section
          </Button>
        </div>
      ) : (
        <>
          {/* Section List */}
          {!previewMode && (
            <div className="space-y-3">
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: section.color }}
                      >
                        {section.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{section.name}</h4>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Rows:</span> {section.rows}
                          </div>
                          <div>
                            <span className="font-medium">Seats/Row:</span> {section.seatsPerRow}
                          </div>
                          <div>
                            <span className="font-medium">Total Seats:</span> {section.rows * section.seatsPerRow}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Starting Row:</span> {section.startingRow}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection(section)
                          setShowSectionForm(true)
                        }}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSection(section.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Preview Mode */}
          {previewMode && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-4">Seating Preview</h4>
              <div className="space-y-6">
                {sections.map((section) => {
                  const sectionSeats = arrangement?.seats.filter(s => s.section === section.id) || []
                  const rows = Array.from(new Set(sectionSeats.map(s => s.row))).sort()
                  
                  return (
                    <div key={section.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: section.color }}
                        />
                        <span className="font-semibold text-gray-900">{section.name}</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 overflow-x-auto">
                        <div className="flex flex-col gap-2">
                          {rows.map((row) => {
                            const rowSeats = sectionSeats
                              .filter(s => s.row === row)
                              .sort((a, b) => parseInt(a.number) - parseInt(b.number))
                            
                            return (
                              <div key={row} className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-8">{row}</span>
                                <div className="flex gap-1">
                                  {rowSeats.map((seat) => (
                                    <div
                                      key={seat.id}
                                      className={`w-8 h-8 rounded text-xs flex items-center justify-center border ${
                                        seat.isAvailable
                                          ? 'bg-green-100 border-green-300 text-green-800'
                                          : 'bg-gray-200 border-gray-300 text-gray-600'
                                      }`}
                                      title={`${seat.row}${seat.number}`}
                                    >
                                      {seat.number}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {/* Stage indicator */}
                        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded">
                            <span className="text-sm font-semibold">STAGE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Section Form Modal */}
      {showSectionForm && (
        <SectionFormModal
          section={editingSection}
          existingSections={sections}
          onSave={saveSection}
          onCancel={() => {
            setShowSectionForm(false)
            setEditingSection(null)
          }}
        />
      )}
    </div>
  )
}

interface SectionFormModalProps {
  section: SeatingSection | null
  existingSections: SeatingSection[]
  onSave: (section: SeatingSection) => void
  onCancel: () => void
}

function SectionFormModal({ section, existingSections, onSave, onCancel }: SectionFormModalProps) {
  const [formData, setFormData] = useState<SeatingSection>({
    id: section?.id || `section_${Date.now()}`,
    name: section?.name || '',
    color: section?.color || defaultColors[existingSections.length % defaultColors.length],
    rows: section?.rows || 5,
    seatsPerRow: section?.seatsPerRow || 10,
    startingRow: section?.startingRow || 'A'
  })

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a section name')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {section ? 'Edit Section' : 'Add Section'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., VIP, General Admission, Balcony"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rows
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seats per Row
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Row Letter
            </label>
            <input
              type="text"
              maxLength={1}
              value={formData.startingRow}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                if (val) setFormData({ ...formData, startingRow: val })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Rows will be labeled alphabetically starting from this letter</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
              >
                <Save size={16} className="mr-2" />
                Save Section
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

