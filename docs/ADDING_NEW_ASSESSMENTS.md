# Adding New Assessments Guide

This guide explains how to add new assessment types to the Style Assessment application.

## Overview

The application supports multiple assessment types, each with its own:
- ✅ **Configuration file** (JSON)
- ✅ **UI text and branding**  
- ✅ **Questions and phrase sets**
- ✅ **Style definitions and results**
- ✅ **Scoring logic**

## File Structure

```
config/
├── assessments/
│   ├── index.json                 # Assessment registry
│   ├── kinetic-thinking.json      # Example assessment
│   └── your-new-assessment.json   # Your new assessment
└── assessmentConfig.ts            # Configuration loading logic
```

## Step-by-Step Guide

### 1. Create Assessment Configuration File

Create a new JSON file in `/config/assessments/` with your assessment ID as the filename.

**Example: `config/assessments/leadership-style.json`**

```json
{
  "id": "leadership-style",
  "name": "Leadership Style Assessment",
  "shortDescription": "Discover your leadership approach and management style",
  "dimensions": [
    {
      "name": "Decision Making",
      "description": "How you make decisions",
      "categories": ["Analytical", "Intuitive"]
    },
    {
      "name": "Team Interaction",
      "description": "How you work with teams",
      "categories": ["Directive", "Collaborative"]
    }
  ],
  "phraseSets": [
    {
      "category": "Analytical",
      "dimension": "Decision Making",
      "phrases": [
        "I analyze data before deciding",
        "I research all options thoroughly",
        "I prefer evidence-based choices",
        "I evaluate pros and cons carefully"
      ]
    },
    {
      "category": "Intuitive",
      "dimension": "Decision Making",
      "phrases": [
        "I trust my gut instincts",
        "I make quick decisions",
        "I go with my first impression",
        "I rely on experience and intuition"
      ]
    },
    {
      "category": "Directive",
      "dimension": "Team Interaction",
      "phrases": [
        "I give clear instructions",
        "I make the final decisions",
        "I prefer to lead discussions",
        "I set the team direction"
      ]
    },
    {
      "category": "Collaborative",
      "dimension": "Team Interaction",
      "phrases": [
        "I seek input from everyone",
        "I facilitate team discussions",
        "I encourage shared decision-making",
        "I value diverse perspectives"
      ]
    }
  ],
  "assessmentSettings": {
    "defaultQuestionCount": 10,
    "minQuestionCount": 6,
    "maxQuestionCount": 15,
    "allowDuplicatePhrases": false,
    "pairingStrategy": "dimension-focused",
    "ensureEqualDimensionCoverage": true
  },
  "styleDefinitions": {
    "quadrant1": {
      "name": "Visionary Leader",
      "description": "You combine intuitive decision-making with collaborative team interaction. You inspire teams with your vision while encouraging input and participation.",
      "coordinates": { "x": "positive", "y": "positive" },
      "traits": ["Inspirational", "Collaborative", "Visionary", "Inclusive"]
    },
    "quadrant2": {
      "name": "Facilitative Leader", 
      "description": "You combine analytical decision-making with collaborative team interaction. You guide teams through structured processes while ensuring everyone's voice is heard.",
      "coordinates": { "x": "negative", "y": "positive" },
      "traits": ["Analytical", "Facilitative", "Inclusive", "Structured"]
    },
    "quadrant3": {
      "name": "Authoritative Leader",
      "description": "You combine analytical decision-making with directive team interaction. You lead through expertise and clear direction, ensuring efficient execution.",
      "coordinates": { "x": "negative", "y": "negative" },
      "traits": ["Analytical", "Directive", "Efficient", "Expert"]
    },
    "quadrant4": {
      "name": "Charismatic Leader",
      "description": "You combine intuitive decision-making with directive team interaction. You lead with charisma and quick decisions, driving teams forward with energy.",
      "coordinates": { "x": "positive", "y": "negative" },
      "traits": ["Charismatic", "Intuitive", "Decisive", "Dynamic"]
    },
    "borderNorth": {
      "name": "Collaborative Synthesizer",
      "description": "You balance analytical and intuitive approaches while maintaining a collaborative style. You bring people together to find the best solutions.",
      "coordinates": { "x": "neutral", "y": "positive" },
      "traits": ["Balanced", "Collaborative", "Synthesizing", "Inclusive"]
    },
    "borderSouth": {
      "name": "Executive Director",
      "description": "You balance analytical and intuitive approaches while maintaining a directive style. You lead with authority but adapt your reasoning as needed.",
      "coordinates": { "x": "neutral", "y": "negative" },
      "traits": ["Balanced", "Directive", "Executive", "Adaptive"]
    },
    "borderWest": {
      "name": "Analytical Facilitator",
      "description": "You use analytical decision-making while balancing directive and collaborative approaches. You lead through logic and structured thinking.",
      "coordinates": { "x": "negative", "y": "neutral" },
      "traits": ["Analytical", "Balanced", "Logical", "Structured"]
    },
    "borderEast": {
      "name": "Intuitive Catalyst",
      "description": "You use intuitive decision-making while balancing directive and collaborative approaches. You energize teams with insights and quick adaptation.",
      "coordinates": { "x": "positive", "y": "neutral" },
      "traits": ["Intuitive", "Balanced", "Catalytic", "Adaptive"]
    },
    "center": {
      "name": "Adaptive Leader",
      "description": "You demonstrate exceptional balance across all leadership dimensions. You adapt your style to the situation and people involved.",
      "coordinates": { "x": "neutral", "y": "neutral" },
      "traits": ["Adaptive", "Versatile", "Balanced", "Situational"]
    }
  },
  "resultsDisplay": {
    "backgroundImage": {
      "enabled": true,
      "url": "/images/leadership-background.png",
      "opacity": 0.8,
      "position": "center",
      "size": "cover"
    },
    "plotSettings": {
      "showGrid": true,
      "gridColor": "#e5e7eb",
      "borderColor": "#374151"
    }
  },
  "uiText": {
    "homePage": {
      "title": "Leadership Style Assessment",
      "subtitle": "Discover your unique leadership approach and learn how to maximize your impact as a leader.",
      "whatYoullLearn": {
        "heading": "What You'll Discover:",
        "items": [
          "Your natural leadership style",
          "How you make decisions under pressure",
          "Your approach to team collaboration",
          "Strategies to enhance your leadership impact"
        ]
      },
      "assessmentDetails": {
        "heading": "Assessment Details:",
        "items": [
          "Takes 5-8 minutes to complete",
          "10 carefully crafted question pairs",
          "Instant personalized results",
          "Research-backed leadership insights"
        ]
      },
      "buttons": {
        "startAssessment": "Discover My Leadership Style",
        "processing": "Analyzing Your Style...",
        "viewResults": "View My Leadership Profile"
      },
      "footer": "Your responses help create a personalized leadership profile. All data is securely processed."
    },
    "assessment": {
      "title": "Leadership Style Assessment",
      "partIntros": {
        "part1": "When making important decisions, which approach feels more natural to you?",
        "part2": "When working with your team, which style do you typically prefer?"
      },
      "instructions": "Move the slider to indicate which statement better describes your leadership approach"
    },
    "auth": {
      "welcomeBack": "Welcome back,",
      "logout": "Logout"
    }
  },
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2024-12-01",
    "totalPhrases": 16,
    "categories": 4,
    "dimensions": 2,
    "description": "Leadership Style Assessment focusing on decision-making and team interaction patterns"
  }
}
```

### 2. Update Assessment Registry

Add your new assessment to `/config/assessments/index.json`:

```json
{
  "assessments": [
    {
      "id": "kinetic-thinking",
      "name": "Kinetic Thinking Style Assessment",
      "shortDescription": "Discover how you engage with entrepreneurial situations",
      "version": "2.0.0",
      "isActive": true,
      "configFile": "kinetic-thinking.json",
      "estimatedTime": "3-5 minutes",
      "questionCount": 12
    },
    {
      "id": "leadership-style",
      "name": "Leadership Style Assessment", 
      "shortDescription": "Discover your leadership approach and management style",
      "version": "1.0.0",
      "isActive": true,
      "configFile": "leadership-style.json",
      "estimatedTime": "5-8 minutes",
      "questionCount": 10
    }
  ],
  "defaultAssessment": "kinetic-thinking",
  "metadata": {
    "lastUpdated": "2024-12-01",
    "totalAssessments": 2,
    "version": "1.0.0"
  }
}
```

### 3. Add Background Image (Optional)

If you specified a background image in `resultsDisplay.backgroundImage.url`:

1. Add your image to `/public/images/`
2. Use formats: PNG, JPG, SVG
3. Recommended size: 1920x1080 or similar
4. Optimize for web (compress file size)

### 4. Test Your Assessment

1. **Build the application**: `npm run build`
2. **Run locally**: `npm run dev`
3. **Test the flow**:
   - Assessment appears in selection screen ✅
   - Questions load correctly ✅
   - Results display properly ✅
   - Database saves assessment ID ✅

### 5. Deploy

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add leadership style assessment"
   git push
   ```

2. **Vercel will auto-deploy** the new assessment

## Configuration Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (used in URLs and database) |
| `name` | string | Display name for the assessment |
| `shortDescription` | string | Brief description for selection screen |
| `phraseSets` | array | Question phrases organized by category |
| `metadata` | object | Version info and statistics |

### Assessment Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `defaultQuestionCount` | 12 | Number of questions to generate |
| `minQuestionCount` | 8 | Minimum questions allowed |
| `maxQuestionCount` | 12 | Maximum questions allowed |
| `allowDuplicatePhrases` | false | Whether phrases can repeat |
| `pairingStrategy` | "dimension-focused" | How to pair phrases |
| `ensureEqualDimensionCoverage` | true | Balance questions across dimensions |

### Pairing Strategies

- **`"random"`**: Completely random phrase pairing
- **`"category-mixed"`**: Mix different categories
- **`"category-exclusive"`**: Keep same categories together
- **`"dimension-focused"`**: Ensure balanced dimension coverage

### Style Definitions

Define 9 result types based on coordinate positions:

| Position | Coordinates | Description |
|----------|-------------|-------------|
| `quadrant1` | (+,+) | Top-right quadrant |
| `quadrant2` | (-,+) | Top-left quadrant |
| `quadrant3` | (-,-) | Bottom-left quadrant |
| `quadrant4` | (+,-) | Bottom-right quadrant |
| `borderNorth` | (0,+) | Top center |
| `borderSouth` | (0,-) | Bottom center |
| `borderWest` | (-,0) | Left center |
| `borderEast` | (+,0) | Right center |
| `center` | (0,0) | Center position |

## Best Practices

### ✅ Content Guidelines

- **Phrase Quality**: Use clear, specific language
- **Balance**: Ensure equal phrase counts per category
- **Distinctiveness**: Make categories clearly different
- **Clarity**: Avoid jargon or ambiguous terms

### ✅ Technical Guidelines

- **File Naming**: Use kebab-case for assessment IDs
- **JSON Validation**: Check syntax before deploying
- **Version Control**: Update version numbers when changing
- **Testing**: Test thoroughly before production

### ✅ UX Guidelines

- **Question Count**: 8-15 questions work best
- **Time Estimate**: Be realistic about completion time
- **Results**: Provide meaningful, actionable insights
- **Mobile**: Ensure content displays well on mobile

## Troubleshooting

### Common Issues

**Assessment doesn't appear in selection**
- Check `isActive: true` in registry
- Verify file names match exactly
- Check JSON syntax

**Questions don't load**
- Verify `phraseSets` structure
- Check category/dimension relationships
- Ensure minimum phrase counts

**Results display incorrectly**
- Verify `styleDefinitions` structure
- Check coordinate mappings
- Validate trait arrays

**Database errors**
- Ensure `assessment_id` field exists in database
- Run migration if needed
- Check environment variables

### Getting Help

- Check console logs for specific errors
- Validate JSON syntax with online tools
- Test with minimal configuration first
- Refer to existing assessments as examples

## Advanced Features

### Custom Scoring Logic

You can extend the scoring engine in `/lib/scoringEngine.ts` to add assessment-specific logic:

```typescript
// Example: Custom scoring for leadership assessment
if (config.id === 'leadership-style') {
  // Add custom scoring logic here
}
```

### Custom Result Components

Create assessment-specific result displays by extending `/components/ResultsDisplay.tsx`.

### Analytics Integration

Results automatically include `assessment_id` for analytics:

```sql
SELECT assessment_id, COUNT(*) as completions 
FROM assessment_results 
GROUP BY assessment_id;
```

---

**Happy Assessment Building!** 🎯

For questions or support, check the main project documentation or create an issue.