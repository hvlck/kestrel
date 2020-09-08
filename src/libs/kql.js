const includeKeywords = ['tabs', 'domain'];

class KestrelQuery {
    constructor(query) {
        this.query = query;
        this.parsed = KestrelQuery.parse(query);

        this.results = [];
    }

    static parse(query) {
        const matchincludeKeywords = () => {
            let matches = includeKeywords.map((item) =>
                query.match(new RegExp(`${item}:{${item == 'domain' ? 1 : 3}}`, 'g'))
            );
            console.warn(matches);
        };

        matchincludeKeywords();

        return [];
    }

    getResults() {
        return this.results;
    }
}

export default KestrelQuery;
