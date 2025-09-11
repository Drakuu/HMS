const express = require('express');
const router = express.Router();
const expense = require("../controllers/expenses.controller")


router.post('/create-expense', expense.createExpense);


router.get('/get-expenses', expense.getExpenses);

router.get('/:id', expense.getExpenseById);


router.put('/:id', expense.updateExpense);

// router.delete('/:id', expenseController.deleteExpense);


router.get('/summary/doctors', expense.getDoctorSummary);

router.get('/summary/totals', expense.getGrandTotals);

router.get('/summary/complete', expense.getCompleteSummary);

router.delete('/delete/:id', expense.softDeleteExpense);

module.exports = router;