# Assessment Configuration

This directory contains the configuration files for managing phrase sets used in the kinetic style assessment.

## Files

### `phrases.json`
The main configuration file containing all phrase sets organized by categories.

**Structure:**
```json
{
  "phraseSets": [
    {
      "category": "Category Name",
      "phrases": [
        "Phrase 1",
        "Phrase 2",
        "..."
      ]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2024-01-01",
    "totalPhrases": 48,
    "categories": 8,
    "description": "Description"
  }
}
```

### `assessmentConfig.ts`
TypeScript configuration and utilities for loading and validating phrase sets.

## How to Update Phrases

### 1. Edit phrases.json
- Add new categories with phrase arrays
- Modify existing phrases
- Remove outdated phrases
- Ensure each category has at least 2 phrases

### 2. Update Metadata
- Increment the version number
- Update `lastUpdated` date
- Update `totalPhrases` count
- Update `categories` count

### 3. Validate Changes
- Visit `/config` in your browser to validate the configuration
- Check for any validation errors
- Test the assessment to ensure phrases pair correctly

## Best Practices

### Phrase Writing Guidelines
- **Be concise**: Keep phrases short and clear
- **Use first person**: Start with "I..." for consistency  
- **Be specific**: Avoid vague or ambiguous language
- **Balance opposing views**: Ensure phrases can be meaningfully compared
- **Avoid bias**: Use neutral, professional language

### Category Organization
- **Logical groupings**: Group related behavioral traits
- **Balanced categories**: Aim for 4-8 phrases per category
- **Clear oppositions**: Ensure phrases within a category represent different perspectives
- **Professional focus**: Keep phrases relevant to workplace behavior

### Example Categories
- Planning vs Flexibility
- Leadership vs Collaboration  
- Detail vs Big Picture
- Individual vs Team
- Process vs Outcome
- Stability vs Change

## Technical Details

### Loading Process
1. App loads `phrases.json` at runtime
2. Configuration is cached for performance
3. Phrases are flattened into a single pool
4. Random pairing and left/right positioning occurs

### Validation Rules
- Each category must have at least 2 phrases
- Category names cannot be empty
- Phrase arrays cannot be empty
- Configuration must be valid JSON

### Error Handling
- Invalid JSON falls back to hardcoded phrases
- Missing categories are skipped
- Validation errors are displayed in the config UI

## Advanced Configuration

### Assessment Settings
You can modify settings in `assessmentConfig.ts`:

```typescript
export const DEFAULT_SETTINGS: AssessmentSettings = {
  defaultQuestionCount: 5,
  allowDuplicatePhrases: false,
  requireAllCategories: false,
  shuffleWithinCategories: true,
  pairingStrategy: 'random'
}
```

### Custom Pairing Strategies
- `'random'`: Completely random pairing across all phrases
- `'category-mixed'`: Prefer pairing phrases from different categories  
- `'category-exclusive'`: Only pair phrases within the same category

## Troubleshooting

### Common Issues
1. **JSON Syntax Errors**: Validate JSON syntax online
2. **Missing Commas**: Check for trailing commas in arrays/objects
3. **Empty Categories**: Ensure all categories have phrases
4. **Duplicate Phrases**: Remove duplicate phrases within categories

### Testing
- Use the `/config` page to validate changes
- Test assessments after making changes
- Check browser console for loading errors
- Verify phrase counts match metadata

## Version History
- v1.0.0: Initial configuration system
- Update this section when making significant changes