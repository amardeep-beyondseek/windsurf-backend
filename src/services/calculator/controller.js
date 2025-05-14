// In-memory store for calculation history
const calculationHistory = [];

// Helper to add to history
const addToHistory = (operation, inputs, result) => {
  const calculation = {
    id: calculationHistory.length + 1,
    operation,
    inputs,
    result,
    timestamp: new Date().toISOString()
  };
  
  calculationHistory.unshift(calculation); // Add to beginning
  
  // Keep only the last 10 calculations
  if (calculationHistory.length > 10) {
    calculationHistory.pop();
  }
  
  return calculation;
};

// Addition
exports.add = (req, res) => {
  const { a, b } = req.body;
  
  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Both "a" and "b" parameters are required' });
  }
  
  const numA = Number(a);
  const numB = Number(b);
  
  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: 'Parameters must be valid numbers' });
  }
  
  const result = numA + numB;
  const calculation = addToHistory('addition', { a: numA, b: numB }, result);
  
  res.json(calculation);
};

// Subtraction
exports.subtract = (req, res) => {
  const { a, b } = req.body;
  
  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Both "a" and "b" parameters are required' });
  }
  
  const numA = Number(a);
  const numB = Number(b);
  
  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: 'Parameters must be valid numbers' });
  }
  
  const result = numA - numB;
  const calculation = addToHistory('subtraction', { a: numA, b: numB }, result);
  
  res.json(calculation);
};

// Multiplication
exports.multiply = (req, res) => {
  const { a, b } = req.body;
  
  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Both "a" and "b" parameters are required' });
  }
  
  const numA = Number(a);
  const numB = Number(b);
  
  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: 'Parameters must be valid numbers' });
  }
  
  const result = numA * numB;
  const calculation = addToHistory('multiplication', { a: numA, b: numB }, result);
  
  res.json(calculation);
};

// Division
exports.divide = (req, res) => {
  const { a, b } = req.body;
  
  if (a === undefined || b === undefined) {
    return res.status(400).json({ error: 'Both "a" and "b" parameters are required' });
  }
  
  const numA = Number(a);
  const numB = Number(b);
  
  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: 'Parameters must be valid numbers' });
  }
  
  if (numB === 0) {
    return res.status(400).json({ error: 'Cannot divide by zero' });
  }
  
  const result = numA / numB;
  const calculation = addToHistory('division', { a: numA, b: numB }, result);
  
  res.json(calculation);
};

// Power
exports.power = (req, res) => {
  const { base, exponent } = req.body;
  
  if (base === undefined || exponent === undefined) {
    return res.status(400).json({ error: 'Both "base" and "exponent" parameters are required' });
  }
  
  const numBase = Number(base);
  const numExponent = Number(exponent);
  
  if (isNaN(numBase) || isNaN(numExponent)) {
    return res.status(400).json({ error: 'Parameters must be valid numbers' });
  }
  
  const result = Math.pow(numBase, numExponent);
  const calculation = addToHistory('power', { base: numBase, exponent: numExponent }, result);
  
  res.json(calculation);
};

// Square root
exports.sqrt = (req, res) => {
  const { number } = req.body;
  
  if (number === undefined) {
    return res.status(400).json({ error: 'The "number" parameter is required' });
  }
  
  const num = Number(number);
  
  if (isNaN(num)) {
    return res.status(400).json({ error: 'Parameter must be a valid number' });
  }
  
  if (num < 0) {
    return res.status(400).json({ error: 'Cannot calculate square root of a negative number' });
  }
  
  const result = Math.sqrt(num);
  const calculation = addToHistory('square root', { number: num }, result);
  
  res.json(calculation);
};

// Get calculation history
exports.getHistory = (req, res) => {
  // Get limit from query params or default to all
  const limit = req.query.limit ? parseInt(req.query.limit) : calculationHistory.length;
  
  res.json(calculationHistory.slice(0, limit));
};
