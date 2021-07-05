export function stringLooseMatched(item: string, filterStr: string): boolean {
    var search = item.toLowerCase();
    if (filterStr === '') return true;
    for (var str of filterStr.toLowerCase().split(' ')) {
        if (!search.includes(str)) return false;
    }
    return true;
}