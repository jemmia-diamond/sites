export class StringUtils {
    //#region Randomize
    static random(length: number) {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    static hexStringToArrayBuffer(hexString: string) {
        // remove the leading 0x
        hexString = hexString.replace(/^0x/, '');

        // check for some non-hex characters
        const bad = hexString.match(/[G-Z\s]/i);

        // split the string into pairs of octets
        const pairs = hexString.match(/[\dA-F]{2}/gi);

        // convert the octets to integers
        const integers = pairs!.map(function (s) {
            return parseInt(s, 16);
        });

        const array = new Uint8Array(integers);

        return array.buffer;
    }
}
