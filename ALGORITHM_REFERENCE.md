# Enhanced Dashboard - Algorithm Reference Card

## 📊 Core Algorithms

### 1. Trend Detection Algorithm

**Purpose**: Determine if health risk is increasing, decreasing, or stable

**Formula**:
```python
change = latest_risk - previous_risk

if change > 5:
    trend = "increasing"
elif change < -5:
    trend = "decreasing"
else:
    trend = "stable"
```

**Thresholds**:
- Increasing: Change > 5%
- Decreasing: Change < -5%
- Stable: -5% ≤ Change ≤ 5%

**Example**:
```
Latest Risk: 58%
Previous Risk: 45%
Change: 58 - 45 = 13%
Result: "increasing" (13 > 5)
```

---

### 2. Risk Change Percentage

**Purpose**: Calculate percentage change in risk over time

**Formula**:
```python
change_percentage = (change / previous_risk) × 100
```

**Example**:
```
Change: 13%
Previous Risk: 45%
Change %: (13 / 45) × 100 = 28.89%
Result: "Risk increased by 28.89%"
```

---

### 3. BMI Calculation

**Purpose**: Calculate Body Mass Index from weight and height

**Formula**:
```python
BMI = weight_kg / (height_m)²
where height_m = height_cm / 100
```

**Categories**:
- Underweight: BMI < 18.5
- Normal: 18.5 ≤ BMI ≤ 24.9
- Overweight: 25 ≤ BMI ≤ 29.9
- Obese: BMI ≥ 30

**Example**:
```
Weight: 80 kg
Height: 175 cm = 1.75 m
BMI: 80 / (1.75)² = 80 / 3.0625 = 26.12
Result: "Overweight"
```

---

### 4. Risk Categorization

**Purpose**: Classify risk level based on probability

**Formula**:
```python
risk_percentage = probability × 100

if risk_percentage > 70:
    category = "critical"
elif risk_percentage > 50:
    category = "warning"
elif risk_percentage > 30:
    category = "info"
else:
    category = "success"
```

**Thresholds**:
- Critical: > 70%
- Warning: 50-70%
- Info: 30-50%
- Success: < 30%

**Example**:
```
Probability: 0.65
Risk %: 0.65 × 100 = 65%
Result: "warning" (50 < 65 ≤ 70)
```

---

### 5. Warning Message Generation

**Purpose**: Generate contextual warning based on trend and risk

**Logic**:
```python
if trend == "increasing" and current_risk > 60:
    warning = f"Risk increased by {change_pct}%. Consult specialist."
elif trend == "increasing":
    warning = f"Risk trending upward. Monitor closely."
elif trend == "decreasing":
    warning = f"Good progress! Risk decreased by {abs(change_pct)}%."
else:
    warning = f"Risk remains stable. Continue healthy habits."
```

**Examples**:
```
Scenario 1:
  Trend: increasing, Risk: 75%, Change: 15%
  → "Risk increased by 15%. Consult specialist."

Scenario 2:
  Trend: decreasing, Risk: 40%, Change: -10%
  → "Good progress! Risk decreased by 10%."

Scenario 3:
  Trend: stable, Risk: 50%, Change: 2%
  → "Risk remains stable. Continue healthy habits."
```

---

### 6. Time Window Filtering

**Purpose**: Filter predictions within specific time period

**Formula**:
```python
from datetime import datetime, timedelta

thirty_days_ago = datetime.utcnow() - timedelta(days=30)

recent_predictions = Prediction.query.filter(
    Prediction.user_id == user_id,
    Prediction.created_at >= thirty_days_ago
).all()
```

**Time Windows**:
- Last 7 days: `timedelta(days=7)`
- Last 30 days: `timedelta(days=30)`
- Last 90 days: `timedelta(days=90)`

---

### 7. Moving Average (Future Enhancement)

**Purpose**: Smooth out fluctuations in risk data

**Formula**:
```python
def moving_average(data, window_size=3):
    averages = []
    for i in range(len(data) - window_size + 1):
        window = data[i:i + window_size]
        avg = sum(window) / window_size
        averages.append(avg)
    return averages
```

**Example**:
```
Data: [45, 52, 48, 55, 60]
Window: 3
MA: [(45+52+48)/3, (52+48+55)/3, (48+55+60)/3]
   = [48.33, 51.67, 54.33]
```

---

## 🎯 Decision Trees

### AI Copilot Insight Generation

```
START
  │
  ├─ Is risk > 70%?
  │  ├─ YES → Generate CRITICAL insight
  │  │        "High risk detected. Immediate consultation."
  │  │
  │  └─ NO → Is risk > 50%?
  │     ├─ YES → Generate WARNING insight
  │     │        "Moderate risk. Lifestyle changes advised."
  │     │
  │     └─ NO → Is BMI > 30?
  │        ├─ YES → Generate WARNING insight
  │        │        "BMI indicates obesity."
  │        │
  │        └─ NO → Is user smoker?
  │           ├─ YES → Generate CRITICAL insight
  │           │        "Smoking increases disease risk."
  │           │
  │           └─ NO → Generate SUCCESS insight
  │                    "Health metrics look good."
END
```

### Risk Forecast Trend Detection

```
START
  │
  ├─ Calculate: change = latest - previous
  │
  ├─ Is change > 5?
  │  ├─ YES → Trend = "increasing"
  │  │        Color = RED
  │  │        Icon = ↑
  │  │
  │  └─ NO → Is change < -5?
  │     ├─ YES → Trend = "decreasing"
  │     │        Color = GREEN
  │     │        Icon = ↓
  │     │
  │     └─ NO → Trend = "stable"
  │              Color = BLUE
  │              Icon = −
END
```

---

## 📈 Chart Configuration

### Line Chart Settings

```javascript
{
  type: 'line',
  data: {
    labels: ['Jan 15', 'Jan 20', 'Jan 25', 'Feb 1'],
    datasets: [{
      label: 'Diabetes Risk %',
      data: [45, 52, 48, 58],
      borderColor: '#ff9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      fill: true,
      tension: 0.4  // Smooth curves
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    }
  }
}
```

**Key Parameters**:
- `tension: 0.4` - Curve smoothness (0 = straight, 1 = very curved)
- `fill: true` - Fill area under line
- `max: 100` - Y-axis maximum (percentage)
- `beginAtZero: true` - Start Y-axis at 0

---

## 🎨 Color Coding System

### Risk Levels
```
Critical (>70%):  #f44336 (Red)
Warning (50-70%): #ff9800 (Orange)
Info (30-50%):    #2196f3 (Blue)
Success (<30%):   #4caf50 (Green)
```

### Trends
```
Increasing: #f44336 (Red)
Decreasing: #4caf50 (Green)
Stable:     #2196f3 (Blue)
```

### Disease Types
```
Diabetes:   #ff9800 (Orange)
Heart:      #f44336 (Red)
Liver:      #9c27b0 (Purple)
Kidney:     #2196f3 (Blue)
```

---

## 🔢 Statistical Formulas

### Standard Deviation (Future Enhancement)
```python
import math

def standard_deviation(data):
    mean = sum(data) / len(data)
    variance = sum((x - mean) ** 2 for x in data) / len(data)
    return math.sqrt(variance)
```

### Percentage Change
```python
def percentage_change(old_value, new_value):
    if old_value == 0:
        return 0
    return ((new_value - old_value) / old_value) * 100
```

### Risk Score Normalization
```python
def normalize_risk(probability):
    """Convert probability (0-1) to risk percentage (0-100)"""
    return probability * 100
```

---

## 🧮 Example Calculations

### Scenario: Diabetes Risk Monitoring

**Initial Data**:
```
Date: 2024-01-15
Glucose: 110 mg/dL
BMI: 26
Blood Pressure: 130/85
Age: 45
Model Output: probability = 0.45
```

**Calculations**:
```
1. Risk Percentage:
   risk = 0.45 × 100 = 45%

2. Risk Category:
   45% → "info" (30 < 45 ≤ 50)

3. BMI Category:
   26 → "overweight" (25 ≤ 26 < 30)
```

**Follow-up Data** (7 days later):
```
Date: 2024-01-22
Glucose: 125 mg/dL
BMI: 27
Blood Pressure: 135/90
Age: 45
Model Output: probability = 0.58
```

**Trend Analysis**:
```
1. Current Risk:
   risk = 0.58 × 100 = 58%

2. Risk Change:
   change = 58 - 45 = 13%

3. Change Percentage:
   change_pct = (13 / 45) × 100 = 28.89%

4. Trend Detection:
   13 > 5 → "increasing"

5. Warning Generation:
   trend = "increasing" AND risk = 58% (< 60)
   → "Risk trending upward. Monitor closely."

6. AI Copilot Insight:
   risk = 58% (> 50)
   → type: "warning"
   → message: "Moderate Diabetes risk (58%). Lifestyle modifications advised."
   → action: "Review diet and exercise routine"
```

---

## 📊 Data Aggregation

### Group Predictions by Disease
```python
disease_groups = {}
for pred in predictions:
    disease = pred.disease_type
    if disease not in disease_groups:
        disease_groups[disease] = []
    disease_groups[disease].append(pred)
```

### Sort by Date
```python
predictions.sort(key=lambda x: x.created_at)
```

### Get Latest N Predictions
```python
latest_predictions = predictions[-5:]  # Last 5
```

---

## 🎯 Threshold Reference Table

| Metric | Low | Normal | Moderate | High | Critical |
|--------|-----|--------|----------|------|----------|
| Risk % | <30 | 30-50 | 50-70 | 70-85 | >85 |
| BMI | <18.5 | 18.5-24.9 | 25-29.9 | 30-34.9 | >35 |
| Change % | <-10 | -10 to -5 | -5 to 5 | 5 to 10 | >10 |
| Glucose (mg/dL) | <70 | 70-100 | 100-125 | 125-150 | >150 |
| BP Systolic | <90 | 90-120 | 120-140 | 140-160 | >160 |

---

## 🔄 Update Frequency

```
Real-time:     Dashboard refresh on load
On-demand:     Manual refresh button
Automatic:     Every 5 minutes (future)
Batch:         Nightly trend recalculation (future)
```

---

## 📝 Pseudocode Summary

### Complete Risk Forecasting Flow
```
FUNCTION generate_risk_forecast(user_id):
    // Step 1: Fetch data
    predictions = GET predictions WHERE user_id = user_id 
                  AND created_at >= 30_days_ago
    
    // Step 2: Group by disease
    groups = GROUP predictions BY disease_type
    
    // Step 3: Analyze each group
    forecasts = []
    FOR EACH disease, preds IN groups:
        IF LENGTH(preds) < 2:
            CONTINUE  // Need at least 2 data points
        
        latest = preds[0]
        previous = preds[-1]
        
        // Step 4: Calculate metrics
        latest_risk = latest.probability × 100
        prev_risk = previous.probability × 100
        change = latest_risk - prev_risk
        change_pct = (change / prev_risk) × 100
        
        // Step 5: Detect trend
        IF change > 5:
            trend = "increasing"
        ELSE IF change < -5:
            trend = "decreasing"
        ELSE:
            trend = "stable"
        
        // Step 6: Generate warning
        warning = generate_warning(disease, trend, latest_risk, change_pct)
        
        // Step 7: Add to results
        forecasts.APPEND({
            disease: disease,
            current_risk: latest_risk,
            previous_risk: prev_risk,
            change: change,
            change_percentage: change_pct,
            trend: trend,
            warning: warning
        })
    
    RETURN forecasts
END FUNCTION
```

---

## 🎓 Academic Notes

**Explainability**: All algorithms use simple arithmetic and clear thresholds
**Reproducibility**: Same inputs always produce same outputs
**Transparency**: No hidden layers or black-box models
**Validation**: Easy to verify calculations manually
**Scalability**: O(n) time complexity for most operations

---

**Quick Reference Version 1.0**
Last Updated: 2024
