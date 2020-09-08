class KestrelQuery {
    constructor(query) {
        this.query = query;
        this.parsed = KestrelQuery.parse(query);

        this.results = [];
    }

    static parse() {
        return [];
    }

    getResults() {
        return this.results;
    }
}

export default KestrelQuery;
