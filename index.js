async function renderLineChart(data) {
    const dimensions = {
        width: 700,
        height: 350,
        margins: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        },
        boundedWidth: dimensions.width - dimensions.margins.left - dimensions.margins.right,
        boundedHeight: dimensions.height - dimensions.margins.bottom - dimensions.margins.top
    }

    const parseDate = d3.timeParse('%d/%m/%Y')
    const yAccessor = d => Number(d['Closing Balance'])
    const xAccessor = d => parseDate(d.Date)

    const wrapper = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)


    const bounds = wrapper.append('g')
    bounds.style('transform', `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice()

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth])

    const lineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))



    bounds.append('path')
        .attr('d', lineGenerator(data))
        .attr('fill', 'none')
        .attr('stroke', 'gold')
        .attr('stroke-width', 2)

    const yAxisGenerator = d3.axisLeft().scale(yScale)

    bounds.append('g').call(yAxisGenerator)

    const xAxisGenerator = d3.axisBottom().scale(xScale)

    bounds.append('g').call(xAxisGenerator).style('transform', `translateY(${dimensions.boundedHeight}px)`)
}


function renderBarChart(data) {
    /**
     * @param {HTMLDivElement} parentDiv
     */
    const parentDiv = document.querySelector('#wrapper')

    const dimensions = {
        width: parentDiv.getBoundingClientRect().width,
        height: parentDiv.getBoundingClientRect().height,
        margins: {
            top: 60,
            right: 15,
            bottom: 60,
            left: 60
        }
    }

    dimensions.boundedWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height - dimensions.margins.bottom - dimensions.margins.top

    const metricAccessor = d => d['Debit Amount']

    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append('g').style('transform', `translate(${dimensions.margins.left}px, ${dimensions.margins.bottom - 20}px)`)


    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, metricAccessor))
        .range([0, dimensions.boundedWidth])
        .nice()


    const binsGenerator = d3.bin().domain(xScale.domain()).value(metricAccessor).thresholds(24)


    const bins = binsGenerator(data)
    console.log(bins);


    const yAccessor = d => d.length
    const yScale = d3.scaleLinear().domain([0, d3.max(bins, yAccessor)]).range([dimensions.boundedHeight, 0])

    const barPadding = 1
    const binGroups = bounds.append('g').selectAll('g').data(bins).join('g')


    binGroups
        .append('rect')
        .attr('x', d => xScale(d.x0) + barPadding / 2)
        .attr('y', d => yScale(yAccessor(d)))
        .attr('width', d => d3.max([
            0,
            xScale(d.x1) - xScale(d.x0) - barPadding
        ]))
        .attr('height', d => dimensions.boundedHeight - yScale(yAccessor(d)))
        .attr('fill', 'cornflowerblue')




    const barText = binGroups.filter(yAccessor)
        .append("text")
        .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
        .attr("y", d => yScale(yAccessor(d)) - 5)
        .text(yAccessor)
        .style("text-anchor", "middle")
        .attr("fill", "darkgrey")
        .style("font-size", "12px")
        .style("font-family", "sans-serif")


    const format = d3.formatLocale({
        decimal: '.',
        thousands: ',',
        grouping: [2],
        currency: ["₹", ""]
    })

    // const format = d3.format(',.2f');

    const xAxisGenerator = d3.axisBottom().scale(xScale) // .tickFormat((d, i) => format(xAccessor(d)) )
    const xAxis = bounds.append('g').call(xAxisGenerator).style('transform', `translateY(${dimensions.boundedHeight}px)`)
    const xAxisLabel = xAxis
        .append('text')
        .attr('x', dimensions.boundedWidth / 2)
        .attr('y', dimensions.margins.bottom - 10)
        .attr('fill', 'black')
        .style('font-size', '1.4em')
        .text('Debit Amount')
        .style('transform', `translateY(25px)`)
}


(async function () {
    let data = await d3.json('./data.json')
    data = data.filter(d => Number(d['Debit Amount']) > 0)
    renderBarChart(data)

    const resizeObserver = new ResizeObserver((_) => {
        document.querySelector('#wrapper').innerHTML = ''
        renderBarChart(data)
    })
    resizeObserver.observe(document.querySelector('#wrapper'));
})();



