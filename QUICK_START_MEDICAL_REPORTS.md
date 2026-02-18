# Medical Report Generation - Quick Start Guide

## 🚀 How to Use

### For End Users:

1. **Complete Disease Assessment**
   - Navigate to any disease prediction form (Diabetes, Heart, Liver, Kidney, or Bone)
   - Fill in all required health parameters
   - Click "Predict" or "Analyze"

2. **View Results**
   - System displays risk assessment
   - Review your risk level and probability

3. **Download Report**
   - Click "Download Medical Report" button
   - PDF report automatically downloads
   - Share with your healthcare provider

### For Developers:

#### Adding Report Generation to New Forms:

```javascript
// 1. Import the utility
import { generateMedicalReport } from '../utils/reportGenerator';

// 2. Call it when user clicks download
<Button onClick={() => generateMedicalReport(
  'diabetes',     // Disease type: 'diabetes', 'heart', 'liver', 'kidney', 'bone'
  formData,       // Your form input data
  result,         // Prediction result from API
  patientInfo     // Optional: { name: 'John', age: 45, gender: 'Male' }
)}>
  Download Medical Report
</Button>
```

#### Adding New Disease Type:

Edit `src/utils/reportGenerator.js` and add configuration:

```javascript
const DISEASE_CONFIG = {
  // ... existing configs
  
  newDisease: {
    title: 'New Disease Assessment',
    parameters: [
      { key: 'param1', label: 'Parameter 1', unit: 'mg/dL' },
      { key: 'param2', label: 'Parameter 2', unit: '' }
    ],
    factors: {
      high: ['Factor 1', 'Factor 2', 'Factor 3'],
      low: ['Normal factor 1', 'Normal factor 2']
    },
    recommendations: {
      high: ['Recommendation 1', 'Recommendation 2'],
      low: ['Maintain healthy lifestyle']
    }
  }
};
```

## 📋 Report Customization

### Change Colors:

In `reportGenerator.js`, modify the color arrays:

```javascript
// Risk level colors [R, G, B]
const boxColor = riskCategory === 'high' ? [220, 53, 69] :    // Red
                 riskCategory === 'moderate' ? [255, 193, 7] : // Yellow
                 [40, 167, 69];                                 // Green
```

### Change Logo:

Replace `public/logo.png` with your logo (recommended size: 200x200px)

### Modify Layout:

Adjust spacing and positioning in `reportGenerator.js`:

```javascript
const margin = 20;        // Page margins
let yPos = 20;           // Starting Y position
const pageWidth = doc.internal.pageSize.width;
```

## 🎨 Report Sections

Each report includes:

1. **Header** - Logo, system name, title, date, report ID
2. **Patient Info** - Name, age, gender
3. **Clinical Parameters** - Disease-specific test values
4. **Risk Assessment** - Color-coded risk level and probability
5. **Contributing Factors** - 3-4 key risk factors
6. **Recommendations** - 3-5 actionable steps
7. **Footer** - Disclaimer and system info

## 🔧 Troubleshooting

### Logo Not Showing:
- Ensure `public/logo.png` exists
- Check file format (PNG recommended)
- Verify file size (< 1MB recommended)

### Report Not Downloading:
- Check browser console for errors
- Verify jsPDF is installed: `npm list jspdf`
- Ensure popup blockers are disabled

### Wrong Data in Report:
- Verify formData keys match DISEASE_CONFIG parameters
- Check result object structure from API
- Console.log data before calling generateMedicalReport

### Formatting Issues:
- Adjust yPos increments for spacing
- Modify maxWidth for text wrapping
- Check page height limits (pageHeight - 40)

## 📱 Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🎯 Best Practices

1. **Always validate data** before generating report
2. **Include patient info** when available for better reports
3. **Test with different risk levels** to ensure proper formatting
4. **Keep recommendations concise** (1-2 lines each)
5. **Use consistent units** across all parameters

## 📞 Support

For issues or questions:
- Check `MEDICAL_REPORT_IMPLEMENTATION.md` for detailed documentation
- Review `src/utils/reportGenerator.js` for implementation details
- Test with sample data first before production use

## ✨ Tips

- Reports are generated client-side (no server required)
- Each report has unique ID for tracking
- PDFs are optimized for printing (A4 size)
- All data is formatted professionally
- Color coding helps quick risk identification

---

**Ready to use!** The system is fully integrated and ready for production. Just ensure your logo is in place and start generating professional medical reports! 🎉
