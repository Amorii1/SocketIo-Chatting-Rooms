import moment from 'moment'

export function formatMessage(username: any, txt: any) {
    return {
        username,
        txt,
        time: moment().format('h:mm a'),
    }
}
