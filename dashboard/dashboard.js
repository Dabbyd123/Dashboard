const Papa = require('papaparse');
const moment = require('moment');
const { ipcRenderer } = require('electron');

const date = [];
const GS = [];
const GF = [];
const QF = [];
const QS = [];
const HHGS = [];
const HHGF = [];
const HHQS = [];
const HHQF = [];
const units = [];
const yield = [];
const output = [];
const scrap = [];
const totalSpools = [];
const parsedunits = [];
const linesDown = [];

const daysPassed = ['1-Dec', '2-Dec', '3-Dec', '4-Dec', '5-Dec', '6-Dec', '7-Dec', '8-Dec', '9-Dec', '10-Dec', '11-Dec', '12-Dec', '13-Dec', '14-Dec', '15-Dec', '16-Dec', '17-Dec', '18-Dec', '19-Dec', '20-Dec'];

const extruderInfo = [
    {
        unitType: 'QS',
        unitsPerDay: 389189,
        extrusionYield: .92,
        conversionYield: .95
    },
    {
        unitType: 'QF',
        unitsPerDay: 291892,
        extrusionYield: .92,
        conversionYield: .95
    },
    {
        unitType: 'GS',
        unitsPerDay: 226093,
        extrusionYield: .92,
        conversionYield: .95
    },
    {
        unitType: 'GF',
        unitsPerDay: 193794,
        extrusionYield: .92,
        conversionYield: .95
    },
    {
        unitType: 'HH-QS',
        unitsPerDay: 345600,
        extrusionYield: .92,
        conversionYield: .95
    },
    {
        unitType: 'HH-QF',
        unitsPerDay: 271543,
        extrusionYield: .92,
        conversionYield: .95
    },
    {
        unitType: 'HH-GS',
        unitsPerDay: 261818,
        extrusionYield: .92,
        conversionYield: .95
    },
    {
        unitType: 'HH-GF',
        unitsPerDay: 196364,
        extrusionYield: .92,
        conversionYield: .95
    }
]

Papa.parse('Extrusion Data.csv', {
    header: true,
    download: true,
    complete: function (results) {
        parsedunits.push(results.data);
        results.data.map(e => {
            date.push(e.Date);
            GS.push(e.GS);
            GF.push(e.GF);
            QF.push(e.QF);
            QS.push(e.QS);
            HHGS.push(e['HH-GS']);
            HHGF.push(e['HH-GF']);
            HHQS.push(e['HH-QS']);
            HHQF.push(e['HH-QF']);
            yield.push(Number(e.yield));
            output.push(Number(e.output));
            scrap.push(Number(e.scrap));
            totalSpools.push(Number(e['total spools']));
            units.push(e['Units Not Produced']);
        })
    }
})

const weekOneYield = [];
setTimeout(() => weekOneYield.push(...yield.slice(0, 7)), 500);

const weekTwoYield = [];
setTimeout(() => weekTwoYield.push(...yield.slice(7, 14)), 500);

const weekThreeYield = [];
setTimeout(() => weekThreeYield.push(...yield.slice(14, 21)), 500);

const weekFourYield = [];
setTimeout(() => weekFourYield.push(...yield.slice(21, 28)), 500);

const weekFiveYield = [];
setTimeout(() => weekFiveYield.push(...yield.slice(28, 31)), 500);

let sumYield = 0;
setTimeout(() => sumYield = yield.reduce(reducer), 600);

let avgYield = 0;
setTimeout(() => avgYield = sumYield / yield.length, 600);

function getDailyLinesDown() {
    parsedunits.forEach(e => {
        e.map(l => {
            linesDown.push((Number(l.GS) + Number(l.GF) + Number(l.QS) + Number(l.QF) + Number(l['HH-GS']) + Number(l['HH-GF']) + Number(l['HH-QS']) + Number(l['HH-QF'])))
        })
    })
}

setTimeout(() => {
    getDailyLinesDown()
}, 1000);

document.querySelector('.btn-reload-chart').addEventListener('click', e => {
    ipcRenderer.send('reload-dashboard')
})

// Mixed Chart
setTimeout(() => {
    var ctxMixed = document.getElementById('mixedChart').getContext('2d');
    var mixedChart = new Chart(ctxMixed, {
        data: {
            labels: daysPassed,
            datasets: [{
                type: 'bar',
                label: 'Spool Count',
                _data: totalSpools,
                get data() {
                    return this._data;
                },
                set data(value) {
                    this._data = value;
                },
                borderColor: 'rgba(255, 99, 132, 0.2)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'y-axis-1',
            }, {
                type: 'line',
                label: 'Lines Down',
                _data: linesDown,
                get data() {
                    return this._data;
                },
                set data(value) {
                    this._data = value;
                },
                fill: false,
                borderColor: "#84d9ff",
                backgroundColor: "#84d9ff",
                yAxisID: 'y-axis-2'
            }],
        },
        options: {
            legend: {
                position: 'bottom'
            },
            plugins: {
                datalabels: {
                    align: 'end',
                    offset: 1,
                    display: 'auto'
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Date"
                    },
                    offset: true
                }],
                yAxes: [{
                    type: "linear",
                    position: "left",
                    id: "y-axis-1",
                    ticks: {
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Total Spools"
                    }
                }, {
                    type: "linear",
                    position: "right",
                    id: "y-axis-2",
                    ticks: {
                        beginAtZero: true,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Lines Down"
                    }
                }],
            }
        }
    });
}, 1500);


// This function displays the total spool count
function getSpoolsByunitType(unitType) {
    const unitArr = spools.filter(e => e.Type == unitType);
    const spoolCountArr = unitArr.map(e => Number(e.Count));
    const totalSpoolArr = spoolCountArr.reduce((sum, e) => sum + e);
    return totalSpoolArr
};

// Pie Chart
setTimeout(() => {
    var ctxPie = document.getElementById('pieChart').getContext('2d');
    var pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            datasets: [{
                data: [
                    getSpoolsByunitType('GF'),
                    getSpoolsByunitType('GS'),
                    getSpoolsByunitType('QF'),
                    getSpoolsByunitType('QS'),
                    getSpoolsByunitType('HHGF'),
                    getSpoolsByunitType('HHGS'),
                    getSpoolsByunitType('HHQF'),
                    getSpoolsByunitType('HHQS')
                ],
                datalabels: {
                    color: 'blue',
                    font: {
                        weight: 'bold'
                    }
                },
                labels: ['GF', 'GS', 'QF', 'QS', 'HH-GF', 'HH-GS', 'HH-QF', 'HH-QS'],

                backgroundColor: [
                    '#42c1f7',
                    '#ed5353',
                    '#b2def2',
                    '#fe9f9f',
                    '#906bff',
                    '#f9cd60',
                    '#c8bcf4',
                    '#ffe0bf',
                ]
            }],
            labels: ['GF', 'GS', 'QF', 'QS', 'HH GF', 'HH GS', 'HH QF', 'HH QS']
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                datalabels: {
                    formatter: function (value, context) {
                        return `${context.chart.data.labels[context.dataIndex]}: ${value}`;
                    },
                    align: 'end',
                    offset: 25,
                    display: 'auto'
                }
            },
            legend: {
                position: 'bottom',
            }
        }
    });
}, 1000);


function showTotalSpools() {
    setTimeout(() => {
        const display = document.getElementById("total-spools");
        const spoolCount = spools.map(e => e.Count);
        const spoolCountArr = [...spoolCount];
        const totalSpools = spoolCountArr.reduce((accumulator, currentValue) => {
            return accumulator + currentValue
        })
        display.innerHTML = `Current Spool Total: <dfn>${totalSpools}</dfn>`;
    }, 1000);
};

// Unit Need Calculator
function unitNeedCalculator() {
    const unitNeed = document.querySelector('#unit-need');
    const unitType = document.querySelector('#unit-type');
    const daysNeeded = document.querySelector('#days-needed');
    document.querySelector('#calculate-units').addEventListener('click', e => {
        e.preventDefault();
        const selectedunitType = unitType.options[unitType.selectedIndex].text;
        extruderInfo.forEach(l => {
            if (l.unitType == selectedunitType) {
                let units = Number(unitNeed.value);
                let extYield = (units / l.extrusionYield) / l.unitsPerDay;
                let totalNeed = extYield / l.conversionYield;
                daysNeeded.innerHTML = `<b>${totalNeed.toFixed(1)}</b> days needed to make <b>${units.toLocaleString()}</b> units`;
                daysNeeded.classList.add('total-calc');
            }
        });
    });
}

const reducer = (acc, cur) => {
    return (Number(acc) + Number(cur));
};

// This function calculated the daily amount of units lost per unit type. Wrapped in setTimeout because the data needs time to load before displaying the chart.
function dailyunitsLost() {
    setTimeout(() => {

        let gsunit = extruderInfo.filter(e => e.unitType === 'GS');
        let gfunit = extruderInfo.filter(e => e.unitType === 'GF');
        let qsunit = extruderInfo.filter(e => e.unitType === 'QS');
        let qfunit = extruderInfo.filter(e => e.unitType === 'QF');
        let HHgsunit = extruderInfo.filter(e => e.unitType === 'QF');
        let HHgfunit = extruderInfo.filter(e => e.unitType === 'HH-GF');
        let HHqsunit = extruderInfo.filter(e => e.unitType === 'HH-QS');
        let HHqfunit = extruderInfo.filter(e => e.unitType === 'HH-QF');


        date.map(d => {
            const dateNode = document.createElement("td");
            const dateText = document.createTextNode(d);
            dateNode.appendChild(dateText);
            document.querySelector('#dateTR').appendChild(dateNode)
        })

        createTableElement(GS, 'gsTR', gsunit);
        createTableElement(GF, 'gfTR', gfunit);
        createTableElement(QS, 'qsTR', qsunit);
        createTableElement(QF, 'qfTR', qfunit);
        createTableElement(HHGS, 'HHgsTR', HHgsunit);
        createTableElement(HHGF, 'HHgfTR', HHgfunit);
        createTableElement(HHQS, 'HHqsTR', HHqsunit);
        createTableElement(HHQF, 'HHqfTR', HHqfunit);

        parsedunits.map(e => {
            e.forEach(s => {
                let gs = s.GS * gsunit[0].unitsPerDay;
                let gf = s.GF * gfunit[0].unitsPerDay;
                let qs = s.QS * qsunit[0].unitsPerDay;
                let qf = s.QF * qfunit[0].unitsPerDay;
                let HHgs = s['HH-GS'] * HHgsunit[0].unitsPerDay;
                let HHgf = s['HH-GF'] * HHgfunit[0].unitsPerDay;
                let HHqs = s['HH-QS'] * HHqsunit[0].unitsPerDay;
                let HHqf = s['HH-QF'] * HHqfunit[0].unitsPerDay;
                const total = gs + gf + qs + qf + HHgs + HHgf + HHqs + HHqf;
                const totalStr = Math.round(total);

                const node = document.createElement("td");
                const textNode = document.createTextNode(totalStr.toLocaleString());
                node.appendChild(textNode);
                document.querySelector('#unitsProd').appendChild(node)
            })
        })
    }, 2000)
}

function createTableElement(mapVar, id, arr) {
    mapVar.map(e => {
        const node = document.createElement("td");
        const textNode = document.createTextNode(`${(Number(e) * arr[0].unitsPerDay)}`);
        node.appendChild(textNode);
        document.querySelector(`#${id}`).appendChild(node);
    })
}

// function for calculating the totals and pushing them to the table. Wrapped in setTimeout because the data needs time to load before displaying the chart.
function dailyunitsLostTotals() {
    setTimeout(() => {

        let gsArr = [];
        let gfArr = [];
        let qsArr = [];
        let qfArr = [];
        let HHgsArr = [];
        let HHgfArr = [];
        let HHqsArr = [];
        let HHqfArr = [];
        let unitTotalArr = [];

        const gsTR = document.querySelector('#gsTR').childNodes;
        const gfTR = document.querySelector('#gfTR').childNodes;
        const qsTR = document.querySelector('#qsTR').childNodes;
        const qfTR = document.querySelector('#qfTR').childNodes;
        const HHgsTR = document.querySelector('#HHgsTR').childNodes;
        const HHgfTR = document.querySelector('#HHgfTR').childNodes;
        const HHqsTR = document.querySelector('#HHqsTR').childNodes;
        const HHqfTR = document.querySelector('#HHqfTR').childNodes;
        const unitTotal = document.querySelector('#unitsProd').childNodes;

        getColumnTotals(gsTR, gsArr);
        getColumnTotals(gfTR, gfArr);
        getColumnTotals(qsTR, qsArr);
        getColumnTotals(qfTR, qfArr);
        getColumnTotals(HHgsTR, HHgsArr);
        getColumnTotals(HHgfTR, HHgfArr);
        getColumnTotals(HHqsTR, HHqsArr);
        getColumnTotals(HHqfTR, HHqfArr);
        unitTotal.forEach(e => {
            if (e.innerHTML !== undefined & e.innerHTML !== 'Total Units Not Produced') {
                unitTotalArr.push(e.innerHTML.replace(/,/g, ""))
            }
        })

        appendToTable("gsTotal", gsArr.reduce(reducer).toLocaleString())
        appendToTable("gfTotal", gfArr.reduce(reducer).toLocaleString())
        appendToTable("qsTotal", qsArr.reduce(reducer).toLocaleString())
        appendToTable("qfTotal", qfArr.reduce(reducer).toLocaleString())
        appendToTable("HHgsTotal", HHgsArr.reduce(reducer).toLocaleString())
        appendToTable("HHgfTotal", HHgfArr.reduce(reducer).toLocaleString())
        appendToTable("HHqsTotal", HHqsArr.reduce(reducer).toLocaleString())
        appendToTable("HHqfTotal", HHqfArr.reduce(reducer).toLocaleString());
        appendToTable("unitsProdTotal", unitTotalArr.reduce(reducer).toLocaleString())

    }, 3000);

    function getColumnTotals(column, arr) {
        column.forEach(e => {
            if (e.innerHTML >= 0) {
                arr.push(e.innerHTML);
            }
        });
    }
}

// This function is responsible for creating the table chart underneath the stacked column chart. 
function makeTable() {
    dailyunitsLost();
    dailyunitsLostTotals();
}

function appendToTable(id, nodeText) {
    const node = document.createElement("td");
    const textNode = document.createTextNode(`${nodeText}`);
    node.appendChild(textNode);
    document.querySelector(`#${id}`).appendChild(node);
}

// Stacked column chart, wrapped in setTimeout because the data needs time to load before displaying the chart.
setTimeout(function () {
    var ctxStack = document.getElementById("ctxStack").getContext('2d');
    var stackChart = new Chart(ctxStack, {
        type: 'bar',
        data: {
            datasets: [
                {
                    label: 'GS',
                    backgroundColor: '#ed5353',
                    data: GS
                },
                {
                    label: 'GF',
                    backgroundColor: '#42c1f7',
                    data: GF,
                },
                {
                    label: 'QF',
                    backgroundColor: '#b2def2',
                    data: QF
                },
                {
                    label: 'QS',
                    backgroundColor: '#fe9f9f',
                    data: QS
                },
                {
                    label: 'HH-GS',
                    backgroundColor: '#f9cd60',
                    data: HHGS
                },
                {
                    label: 'HH-GF',
                    backgroundColor: '#906bff',
                    data: HHGF
                },
                {
                    label: 'HH-QS',
                    backgroundColor: '#ffe0bf',
                    data: HHQS
                },
                {
                    label: 'HH-QF',
                    backgroundColor: '#c8bcf4',
                    data: HHQF
                },
            ],
            labels: date
        },
        options: {
            tooltips: {
                displayColors: true,
            },
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                    },
                    type: 'linear'
                }]
            },
            responsive: true,
            maintainAspectRatio: true,
            legend: {
                position: 'top',
            },
        }
    });
}, 1000);

setTimeout(() => {
    // Line chart for extrusion yield
    var lineChart = document.querySelector('#lineChart').getContext('2d');
    var myLineChart = new Chart(lineChart, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                // Each data array would simply be the extrusion yield per day for that week. I am using the daily extrusion report sent to me every morning to get the average yield for the previous day.
                data: weekOneYield,
                label: "Week 1",
                borderColor: "#3e95cd",
                fill: false
            }, {
                data: weekTwoYield,
                label: "Week 2",
                borderColor: "#8e5ea2",
                fill: false
            }, {
                data: weekThreeYield,
                label: "Week 3",
                borderColor: "#3cba9f",
                fill: false
            }, {
                data: weekFourYield,
                label: "Week 4",
                borderColor: "#e8c3b9",
                fill: false
            }, {
                data: weekFiveYield,
                label: "Week 4",
                borderColor: "#e44747",
                fill: false
            },

            // This is the MTD average yield. I need to understand how this average yield is calculated for the month.  I don't think it's accurate on a daily basis because the yield changes when they factor in scrap at a later date
            {
                data: [avgYield.toFixed(2), avgYield.toFixed(2), avgYield.toFixed(2), avgYield.toFixed(2), avgYield.toFixed(2), avgYield.toFixed(2), avgYield.toFixed(2)],
                label: "MTD Average",
                borderColor: "#e6e654",
                fill: true
            }
            ],
        },
        options: {
            plugins: {
                datalabels: {
                    align: 'end',
                    offset: 2,
                    display: 'auto'
                }
            },
        }
    })
}, 2000)



const scrapData = [];
setTimeout(() => {
    scrap.forEach(e => output.forEach(o => {
        scrapData.push(Math.round((o + e) / e))
    }))
}, 1000)

setTimeout(() => {
    // Pareto chart for MTD extrusion lbs and scrap
    var ctxPareto = document.querySelector('#paretoLbsChart').getContext('2d');
    var paretoChart = new Chart(ctxPareto, {
        data: {
            labels: daysPassed,
            datasets: [{
                type: "line",
                label: "Scrap %",
                borderColor: "#ee6969",
                backgroundColor: "#ee6969",
                pointBorderWidth: 5,
                fill: false,
                data: scrapData,
                yAxisID: 'y-axis-2'
            }, {
                type: "bar",
                label: "Output Lbs",
                borderColor: "#89d9ff",
                backgroundColor: "#89d9ff",
                data: output,
                yAxisID: 'y-axis-1'
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: '#FFF'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                        fontColor: '#FFF'
                    },
                    offset: true
                }],
                yAxes: [{
                    type: "linear",
                    position: "left",
                    id: "y-axis-1",
                    ticks: {
                        beginAtZero: true,
                        fontColor: '#fff'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Output Lbs",
                        fontColor: '#FFF'
                    }
                }, {
                    type: "linear",
                    position: "right",
                    id: "y-axis-2",
                    ticks: {
                        callback: function (value) {
                            return value + "%";
                        },
                        fontColor: '#FFF',
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Scrap Lbs",
                        fontColor: '#FFF'
                    }
                }],

            },
            plugins: {
                datalabels: {
                    align: 'end',
                    offset: 2,
                    display: 'auto'
                }
            },
            legend: {
                labels: {
                    fontColor: '#FFF'
                }
            }
        }
    })
}, 1500)


// If we are needing to identify the weeks in the month and list out the days of that week for any charts or for scheduling purposes, this function accepts a 0-indexed argument as the desired week. You can also change the return of this function to just give you the list of weeks.
function weeks_in_month(week) {
    let year = moment().format('YYYY');  // change year
    let month = moment().format('M'); // change month here
    let startDate = moment([year, month - 1])
    let endDate = moment(startDate).endOf('month');

    var dates = [];
    var weeks = [];

    var per_week = [];
    var difference = endDate.diff(startDate, 'days');

    per_week.push(startDate.toDate())
    let index = 0;
    let last_week = false;
    while (startDate.add(1, 'days').diff(endDate) < 0) {
        if (startDate.day() != 0) {
            per_week.push(startDate.toDate())
        }
        else {
            if ((startDate.clone().add(7, 'days').month() == (month - 1))) {
                weeks.push(per_week)
                per_week = []
                per_week.push(startDate.toDate())
            }
            else if (Math.abs(index - difference) > 0) {
                if (!last_week) {
                    weeks.push(per_week);
                    per_week = [];
                }
                last_week = true;
                per_week.push(startDate.toDate());
            }
        }
        index += 1;
        if ((last_week == true && Math.abs(index - difference) == 0) ||
            (Math.abs(index - difference) == 0 && per_week.length == 1)) {
            weeks.push(per_week)
        }
        dates.push(startDate.clone().toDate());
    }
    console.log(weeks[week], weeks.length);
}
// weeks_in_month(0)

showTotalSpools();
makeTable();
unitNeedCalculator();