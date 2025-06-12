"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function ProductVariationForm() {
  const [options, setOptions] = useState([{ name: "Size", values: ["Small", "Medium", "Large"] }])
  const [newOption, setNewOption] = useState("")
  const [newValue, setNewValue] = useState("")
  const [selectedOption, setSelectedOption] = useState(0)

  const addOption = () => {
    if (newOption.trim() !== "") {
      setOptions([...options, { name: newOption, values: [] }])
      setNewOption("")
    }
  }

  const removeOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
    if (selectedOption >= newOptions.length) {
      setSelectedOption(Math.max(0, newOptions.length - 1))
    }
  }

  const addValue = () => {
    if (newValue.trim() !== "" && options.length > 0) {
      const newOptions = [...options]
      newOptions[selectedOption].values.push(newValue)
      setOptions(newOptions)
      setNewValue("")
    }
  }

  const removeValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options]
    newOptions[optionIndex].values.splice(valueIndex, 1)
    setOptions(newOptions)
  }

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-0 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Product Variations
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Add variations like size, color, material, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="option-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Option Name
              </Label>
              <Input
                id="option-name"
                placeholder="e.g. Size, Color, Material"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <Button
              onClick={addOption}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {options.map((option, index) => (
              <Badge
                key={index}
                variant={selectedOption === index ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedOption === index
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    : "backdrop-blur-md bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                }`}
                onClick={() => setSelectedOption(index)}
              >
                {option.name}
                <button
                  className="ml-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 p-0.5 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeOption(index)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {options.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="option-value" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {options[selectedOption]?.name} Values
                </Label>
                <Input
                  id="option-value"
                  placeholder={`Enter ${options[selectedOption]?.name.toLowerCase()} value`}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <Button
                onClick={addValue}
                className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-violet-600 transition-all duration-300 hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Value
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {options[selectedOption]?.values.map((value, valueIndex) => (
                <Badge
                  key={valueIndex}
                  variant="secondary"
                  className="cursor-pointer backdrop-blur-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105 text-slate-700 dark:text-slate-300"
                >
                  {value}
                  <button
                    className="ml-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500 p-0.5 transition-colors duration-200"
                    onClick={() => removeValue(selectedOption, valueIndex)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium text-lg text-slate-900 dark:text-slate-100">Preview of Variations</h3>
          <div className="rounded-lg border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md bg-white/50 dark:bg-slate-800/50 p-4">
            {options.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm text-slate-600 dark:text-slate-400">
                  {options.map((option) => (
                    <div key={option.name} className="font-semibold">
                      {option.name}
                    </div>
                  ))}
                  <div className="font-semibold">Price</div>
                </div>
                {generateVariationCombinations(options)
                  .slice(0, 10)
                  .map((variation, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-4 border-t border-slate-200/60 dark:border-slate-700/60 pt-4"
                    >
                      {variation.map((value: string, valueIndex: number) => (
                        <div key={valueIndex} className="text-sm text-slate-900 dark:text-slate-100">
                          {value}
                        </div>
                      ))}
                      <div>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="w-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  ))}
                {generateVariationCombinations(options).length > 10 && (
                  <div className="text-center text-sm text-slate-600 dark:text-slate-400 pt-4">
                    ... and {generateVariationCombinations(options).length - 10} more variations
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                Add options and values to generate variations
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to generate all possible combinations of variations
function generateVariationCombinations(options: { name: string; values: string[] }[]): string[][] {
  if (options.length === 0) return []

  const combinations: string[][] = []

  function generateCombos(optionIndex: number, currentCombo: string[]): void {
    if (optionIndex === options.length) {
      combinations.push([...currentCombo])
      return
    }

    const currentOption = options[optionIndex]
    if (currentOption.values.length === 0) {
      generateCombos(optionIndex + 1, [...currentCombo, "Any"])
    } else {
      for (const value of currentOption.values) {
        generateCombos(optionIndex + 1, [...currentCombo, value])
      }
    }
  }

  generateCombos(0, [])
  return combinations
}
