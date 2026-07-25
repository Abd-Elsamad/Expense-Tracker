/* ==========================================================
   MoneyFlow
   app.js
   Author: SMEDO
========================================================== */

/* ============================
   DOM Elements
============================ */

const transactionForm = document.getElementById("transactionForm");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const typeInput = document.getElementById("type");

const transactionList = document.getElementById("transactionList");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const searchInput = document.getElementById("search");

const themeButton = document.querySelector(".theme-btn");

/* ============================
   App State
============================ */

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let expenseChart = null;

/* ============================
   Initialize App
============================ */

function init() {

    loadTheme();

    renderTransactions();

    updateSummary();

    renderChart();

}

init();

/* ============================
   Event Listeners
============================ */

transactionForm.addEventListener("submit", handleSubmit);

searchInput.addEventListener("input", searchTransactions);

themeButton.addEventListener("click", toggleTheme);

/* ============================
   Handle Submit
============================ */

function handleSubmit(event) {

    event.preventDefault();

    const transaction = {

        id: crypto.randomUUID(),

        description: descriptionInput.value.trim(),

        amount: Number(amountInput.value),

        category: categoryInput.value,

        date: dateInput.value,

        type: typeInput.value

    };

    if (!validateTransaction(transaction)) return;

    transactions.push(transaction);

    refreshApp();

    transactionForm.reset();

}

/* ============================
   Validation
============================ */

function validateTransaction(transaction) {

    if (transaction.description === "") {

        alert("Please enter description.");

        return false;

    }

    if (transaction.amount <= 0) {

        alert("Amount must be greater than zero.");

        return false;

    }

    if (transaction.date === "") {

        alert("Choose transaction date.");

        return false;

    }

    return true;

}

/* ============================
   Refresh App
============================ */

function refreshApp() {

    saveTransactions();

    renderTransactions();

    updateSummary();

    renderChart();

}

/* ============================
   Local Storage
============================ */

function saveTransactions() {

    localStorage.setItem(

        "transactions",

        JSON.stringify(transactions)

    );

}
/* ============================
   Render Transactions
============================ */

function renderTransactions(list = transactions) {

    transactionList.innerHTML = "";

    if (list.length === 0) {

        transactionList.innerHTML = `

            <tr>

                <td colspan="6" class="text-center">

                    No Transactions Found

                </td>

            </tr>

        `;

        return;

    }

    list.forEach(transaction => {

        transactionList.innerHTML += `

            <tr>

                <td>${transaction.description}</td>

                <td>${transaction.category}</td>

                <td>${formatCurrency(transaction.amount)}</td>

                <td>${formatDate(transaction.date)}</td>

                <td>

                    <span class="badge badge-${transaction.type}">

                        ${capitalize(transaction.type)}

                    </span>

                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="editTransaction('${transaction.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteTransaction('${transaction.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}

/* ============================
   Delete Transaction
============================ */

function deleteTransaction(id) {

    const confirmDelete = confirm(

        "Delete this transaction?"

    );

    if (!confirmDelete) return;

    transactions = transactions.filter(transaction => {

        return transaction.id !== id;

    });

    refreshApp();

}

/* ============================
   Edit Transaction
============================ */

function editTransaction(id) {

    const transaction = transactions.find(transaction => {

        return transaction.id === id;

    });

    if (!transaction) return;

    descriptionInput.value = transaction.description;

    amountInput.value = transaction.amount;

    categoryInput.value = transaction.category;

    dateInput.value = transaction.date;

    typeInput.value = transaction.type;

    transactions = transactions.filter(item => {

        return item.id !== id;

    });

    refreshApp();

}

/* ============================
   Search Transactions
============================ */

function searchTransactions() {

    const keyword = searchInput.value

        .toLowerCase()

        .trim();

    const filtered = transactions.filter(transaction => {

        return (

            transaction.description

                .toLowerCase()

                .includes(keyword)

            ||

            transaction.category

                .toLowerCase()

                .includes(keyword)

        );

    });

    renderTransactions(filtered);

}
/* ============================
   Update Summary
============================ */

function updateSummary() {

    let income = 0;

    let expense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expense += transaction.amount;

        }

    });

    const balance = income - expense;

    balanceElement.textContent = formatCurrency(balance);

    incomeElement.textContent = formatCurrency(income);

    expenseElement.textContent = formatCurrency(expense);

}

/* ============================
   Render Chart
============================ */

function renderChart() {

    const canvas = document.getElementById("expenseChart");

    if (!canvas) return;

    const income = transactions
        .filter(item => item.type === "income")
        .reduce((total, item) => total + item.amount, 0);

    const expense = transactions
        .filter(item => item.type === "expense")
        .reduce((total, item) => total + item.amount, 0);

    if (expenseChart) {

        expenseChart.destroy();

    }

    expenseChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [

                "Income",

                "Expense"

            ],

            datasets: [

                {

                    data: [

                        income,

                        expense

                    ],

                    backgroundColor: [

                        "#16A34A",

                        "#DC2626"

                    ],

                    borderWidth: 0

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

/* ============================
   Theme
============================ */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const currentTheme = document.body.classList.contains("dark")

        ? "dark"

        : "light";

    localStorage.setItem("theme", currentTheme);

}

function loadTheme() {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

    }

}

/* ============================
   Helpers
============================ */

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-US", {

        style: "currency",

        currency: "USD"

    }).format(amount);

}

function formatDate(date) {

    return new Date(date).toLocaleDateString("en-US", {

        year: "numeric",

        month: "short",

        day: "numeric"

    });

}

function capitalize(text) {

    return text.charAt(0).toUpperCase() + text.slice(1);

}