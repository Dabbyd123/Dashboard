const moment = require('moment');

const doc = document.getElementById('schedule-frame');
const styleBtn = document.querySelector('.style-btn');
const progressBtn = document.querySelector('.progress-btn');
const dateBtn = document.querySelector('.date-btn');
const progPane = document.querySelector('.progress-pane');
const extPane = document.querySelector('.extruder-pane');

const lineProgress = [{
    extruder: "E0",
    daysBehind: (140 / 24).toFixed(1)
},
{
    extruder: "E1",
    daysBehind: (100.8 / 24).toFixed(1)
},
{
    extruder: "E2",
    daysBehind: (4 / 24).toFixed(1)
},
{
    extruder: "E3",
    daysBehind: (-258 / 24).toFixed(1)
},
{
    extruder: "E4",
    daysBehind: (-270.4 / 24).toFixed(1)
},
{
    extruder: "E5",
    daysBehind: (158.8 / 24).toFixed(1)
},
{
    extruder: "E6",
    daysBehind: (72.7 / 24).toFixed(1)
},
{
    extruder: "E7",
    daysBehind: (305.9 / 24).toFixed(1)
},
{
    extruder: "E8",
    daysBehind: (181.8 / 24).toFixed(1)
},
{
    extruder: "E9",
    daysBehind: (185.1 / 24).toFixed(1)
},
{
    extruder: "E10",
    daysBehind: (147.3 / 24).toFixed(1)
},
{
    extruder: "E11",
    daysBehind: (109.4 / 24).toFixed(1)
},
{
    extruder: "E12",
    daysBehind: (38 / 24).toFixed(1)
},
{
    extruder: "E14",
    daysBehind: (20.3 / 24).toFixed(1)
},
{
    extruder: "E22",
    daysBehind: (359 / 24).toFixed(1)
},
{
    extruder: "E41",
    daysBehind: (-106.4 / 24).toFixed(1)
},
{
    extruder: "E42",
    daysBehind: (137.1 / 24).toFixed(1)
},
{
    extruder: "E43",
    daysBehind: (-203 / 24).toFixed(1)
},
{
    extruder: "E44",
    daysBehind: (-208.4 / 24).toFixed(1)
},
]

// Click handler for "Style" button
styleBtn.addEventListener('click', e => {
    extPane.classList.toggle('hidden');
    toggleActive(e);
    const td = doc.querySelectorAll('td');
    td.forEach(e => {
        if (e.innerHTML.includes('TT') & !e.innerHTML.includes('*')) {
            e.classList.toggle('TT');
        } else if (e.innerHTML.includes('MM') & !e.innerHTML.includes('*')) {
            e.classList.toggle('MM');
        } else if (e.innerHTML.includes('WW') & !e.innerHTML.includes('*')) {
            e.classList.toggle('WW');
        } else if (e.innerHTML.includes('AA') & !e.innerHTML.includes('*')) {
            e.classList.toggle('AA');
        } else if (e.innerHTML.includes('HH') & !e.innerHTML.includes('*')) {
            e.classList.toggle('HH');
        } else if (e.innerHTML.includes('LC') || e.innerHTML.includes('SD')) {
            e.classList.toggle('line-change');
        }
    }
    )
})

const extruderInfo = [
    {
        unitType: 'QS',
        unitsPerDay: 389189,
        extrusionYield: .90,
        conversionYield: .91
    },
    {
        unitType: 'QF',
        unitsPerDay: 291892,
        extrusionYield: .90,
        conversionYield: .91
    },
    {
        unitType: 'GS',
        unitsPerDay: 226093,
        extrusionYield: .93,
        conversionYield: .97
    },
    {
        unitType: 'GF',
        unitsPerDay: 193794,
        extrusionYield: .91,
        conversionYield: .92
    },
    {
        unitType: 'HH-QS',
        unitsPerDay: 345600,
        extrusionYield: .92,
        conversionYield: .94
    },
    {
        unitType: 'HH-QF',
        unitsPerDay: 271543,
        extrusionYield: .90,
        conversionYield: .90
    },
    {
        unitType: 'HH-GS',
        unitsPerDay: 261818,
        extrusionYield: .91,
        conversionYield: .90
    },
    {
        unitType: 'HH-GF',
        unitsPerDay: 196364,
        extrusionYield: .92,
        conversionYield: .90
    }
]

// Click handler for "Progress" button
progressBtn.addEventListener('click', e => {
    progPane.classList.toggle('hidden');
    toggleActive(e);
    const rows = doc.querySelectorAll('tr');
    const build = document.getElementById('build-item-qty')
    const currentDate = moment().format("D")
    const scrollDate = (Number(currentDate) + 1);
    const todayArr = [];
    const tomorrowArr = [];
    rows.forEach(e => {
        const cells = e.children;
        const cellArr = [...cells];
        const htmlArr = [];
        const rowArr = [];
        cellArr.forEach(e => {
            rowArr.push(e)
            htmlArr.push(e.innerHTML)
            return (rowArr, htmlArr);
        })
        let runDaysByProduct = htmlArr.reduce(function (allProducts, product) {
            if (product in allProducts) {
                allProducts[product]++
            }
            else {
                allProducts[product] = 1
            }
            return (allProducts)
        }, {})
        console.log(runDaysByProduct)
        getToday();
        const getDateArr = cellArr.slice(2)
        daysPassedHandler(currentDate, getDateArr, todayArr, tomorrowArr, cellArr);
        rowArr[scrollDate].style.borderLeft = '3px solid yellow';
        rowArr[scrollDate].style.borderRight = '3px solid yellow';
    })
    alertOrderChange(todayArr, tomorrowArr, rows)
});


function getToday() {
    const tr = doc.querySelector('tr').children;
    const date = moment().format("M/D");
    const trArr = [...tr];
    trArr.forEach(e => {
        if (e.innerHTML === date) {
            e.classList.add("activeDate");
            e.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "start"
            });
        } else {
            e.classList.remove("activeDate");
        }
    });
}

function toggleActive(e) {
    e.target.classList.toggle('btn-default');
    e.target.classList.toggle('btn-primary');
}

// This function removes the days in the month that have passed
function daysPassedHandler(currentDate, getDateArr, todayArr, tomorrowArr, cellArr) {
    getProgress();
    const daysInMonthCount = Array.from(Array(moment().daysInMonth()).keys());
    daysInMonthCount.forEach(e => {
        if (e < currentDate - 1) {
            cellArr[0].classList.add('hidden');
            cellArr[1].classList.add('hidden');
            getDateArr[e].classList.toggle('hidden');
            const parent = getDateArr[e].parentElement;
            return (parent.children[0])
        } else if (e > Number(currentDate) + 6) {
            getDateArr[e].classList.toggle('hidden');
        }
        else if (e == currentDate - 1) {
            getDateArr[e].childNodes.forEach(s => {
                todayArr.push(s.data);
            });
            getDateArr[e + 1].childNodes.forEach(s => {
                tomorrowArr.push(s.data);
            });
        }
    });
}

// This function is self explanatory, it alerts the user and tells them what current order is changing tomorrow
function alertOrderChange(todayArr, tomorrowArr, rows) {
    const today = [...todayArr.slice(1)];
    const tomorrow = [...tomorrowArr.slice(1)];
    const changeOverItems = today.filter((obj) => tomorrow.indexOf(obj) == -1);
    if (changeOverItems.length == 0) {
        alert((` There are no items scheduled to changeover tomorrow`))
    } else {
        alert(`These items are scheduled to changeover tomorrow: ${changeOverItems.join(', ')}`)
    }
};

// This function sets the days behind/ahead for each line by comparing it to the lineProgress array of objects
function getProgress() {

    const progBarsArr = getProgressDays();
    progBarsArr.forEach(e => {
        const percentSpan = e.children;
        let percentSpanArr = [...percentSpan];
        lineProgress.forEach(l => {
            const progress = (l.daysBehind * -1);
            const txt = document.createTextNode(`${progress}`);
            percentSpanArr.forEach(s => {
                if (s.id == l.extruder && s.className === "prog-bar-percentage") {
                    s.innerHTML = '';
                    s.appendChild(txt);
                }
                if (s.id == l.extruder && s.className === "neg-bar" && progress < 0) {
                    s.style.width = `${(l.daysBehind) * 4}px`;
                }
                if (s.id == l.extruder && s.className === "pos-bar" && progress > 0) {
                    s.style.width = `${(l.daysBehind * -1) * 4}px`;
                }
            });
        });
    })
    function getProgressDays() {
        const progBars = document.querySelectorAll('.progress-bar');
        const progBarsArr = [...progBars];
        return progBarsArr;
    }
}