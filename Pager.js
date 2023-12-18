class Pager {
  constructor (registros, numPagina, cantidadPorPag) {
    this.records = registros
    this.numberOfRecords = registros.length
    this.currentPage = numPagina
    this.recordsPerPage = cantidadPorPag
    this.numberOfPages = this.getNumberOfPages()
  }

  getNumberOfPages () {
    return Math.ceil(this.numberOfRecords / this.recordsPerPage)
  }

  pageRecords () {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage
    const endIndex = startIndex + this.recordsPerPage

    return this.records.slice(startIndex, endIndex)
  }
}

module.exports = { Pager }
