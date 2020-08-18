import { getActiveTab } from '../libs/webUtils.js';
import buildElement from '../libs/utils.js';

const dispatch = (event, status) => {
    document.body.appendChild(buildElement('p', event, {
        className: `banner ${status}`
    }));
}

getActiveTab().then(t => {
    let title = t.title;
    let c = buildElement('p', title, {
        id: 'title',
        title: 'Copy'
    });
    c.addEventListener('click', () => {
        navigator.clipboard.writeText(title).then(() => {
            dispatch('Copied!', 's');
        }).catch(err => {
            dispatch('Failed to copy!', 'f');
        });
    });
    document.body.appendChild(c);
});