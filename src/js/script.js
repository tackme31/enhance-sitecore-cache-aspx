const multipliers = {
    'GB': 1024 * 1024 * 1024,
    'MB': 1024 * 1024,
    'KB': 1024,
    'bytes': 1,
}

const toBytes = withUnit => {
    const splited = withUnit.split(' ')
    const num = splited[0].replace(',', '')
    const unit = splited[1]
    return num * multipliers[unit]
}

const getData = () => Array.from(document.querySelectorAll('#Table1 table tr'))
    .slice(1)
    .map(e => {
        return {
            name: e.children[1].innerText,
            count: e.children[2].innerText,
            size: e.children[3].innerText,
            delta: e.children[4].innerText,
            maxSize: e.children[5].innerText,
        }
    })
    .map(d => {
        const sizeInBytes = toBytes(d.size)
        const maxSizeInBytes = toBytes(d.maxSize)
        const useRate = maxSizeInBytes === 0 ? 0 : sizeInBytes / maxSizeInBytes * 100
        return {
            ...d,
            useRate: Number(useRate.toFixed(2)),
            under80: useRate < 80
        }
    })

const getTotals = () => {
    const totals = document.getElementById('c_totals').innerText
    const entries = totals.match(/(?<=Entries: )[^,]+/)[0]
    const size = totals.match(/(?<=Size: ).+/)[0]
    return {
        entries: parseInt(entries),
        size: parseInt(size)
    }
}

const form = document.getElementsByTagName('form')[0]
const refreshButton = document.getElementsByName('c_refresh')[0].cloneNode()
const clearAllButton = document.getElementsByName('c_clearAll')[0].cloneNode()
form.appendChild(refreshButton)
form.appendChild(clearAllButton)

const enhancedTable = document.createElement('div')
enhancedTable.setAttribute('id', 'enhanced-table')
document.body.appendChild(enhancedTable)

const data = getData()
const table = new Tabulator('#enhanced-table', {
    data: data,
    initialSort: [
        { column: 'useRate', dir: 'desc' }
    ],
    columns: [
        { title: 'Name', field: 'name' },
        { title: 'Count', field: 'count' },
        { title: 'Size', field: 'size', sorter: (a, b) => toBytes(a) - toBytes(b) },
        { title: 'Delta', field: 'delta', sorter: (a, b) => toBytes(a) - toBytes(b) },
        { title: 'Max size', field: 'maxSize', sorter: (a, b) => toBytes(a) - toBytes(b) },
        { title: 'Use rate', field: 'useRate', formatter: cell => cell.getValue() + " %" },
        { title: '< 80%', field: 'under80', formatter: 'tickCross'}
    ],
    rowFormatter: row => {
        const useRate = row.getData().useRate
        if (useRate < 70) {
            return;
        }
        const lightness = -1 * useRate + 165
        const cell = row.getCell('useRate').getElement()    
        cell.style.backgroundColor = `hsl(0, 100%, ${lightness}%)`
    }
})