/**
 * @license
 * echo 0.0.1
 */
; (function (window) {
    var VERSION = '0.0.1'
    const black = '#000'
    const white = '#fff'
    const info = '#0d6efd'
    const debug = '#0dcaf0'
    const warn = '#ffc107'
    const succ = '#198754'
    const error = '#dc3545'
    const L = 'left'
    const R = 'right'
    const B = 'both'
    const N = 'none'
    // Entity ...
    function Entity(t, s) {
        this.t = t
        this.s = s
    }
    // MakeCSS ...
    function MakeCSS(fontColor, bgColor, radiusType, fontSize) {
        let s = [
            `color: ${fontColor};`,
            `background-color: ${bgColor};`,
            'display: inline-block;',
            'font-weight: bold;',
            'padding: 4px 8px 4px 8px;',
        ]
        switch (radiusType) {
            case L:
                s.push('border-radius: 4px 0px 0px 4px;')
                break;
            case R:
                s.push('border-radius: 0px 4px 4px 0px;')
                s.push('margin-right: 4px;')
                break;
            case B:
                s.push('border-radius: 4px 4px 4px 4px;')
                s.push('margin-right: 4px;')
                break;
            default:
                break;
        }
        return s.join(' ')
    }
    class echo {
        VERSION = VERSION
        L = L
        R = R
        B = B
        N = N
        Log(...args) {
            let inputs = [], modifiers = []
            for (let arg of args) {
                if (arg instanceof Entity) {
                    inputs.push(...arg.t)
                    modifiers.push(...arg.s)
                } else {
                    inputs.push(`%c${arg}`)
                    modifiers.push('')
                }
            }
            console.log(inputs.join(''), ...modifiers)
        }
        Info(text, radiusType = 'both', fontSize = 14) {
            return new Entity([`%c${text}`], [MakeCSS(white, info, radiusType, fontSize + 'px',)])
        }
        Debug(text, radiusType = 'both', fontSize = 14) {
            return new Entity([`%c${text}`], [MakeCSS(white, debug, radiusType, fontSize + 'px',)])
        }
        Warn(text, radiusType = 'both', fontSize = 14) {
            return new Entity([`%c${text}`], [MakeCSS(white, warn, radiusType, fontSize + 'px',)])
        }
        Succ(text, radiusType = 'both', fontSize = 14) {
            return new Entity([`%c${text}`], [MakeCSS(white, succ, radiusType, fontSize + 'px',)])
        }
        Error(text, radiusType = 'both', fontSize = 14) {
            return new Entity([`%c${text}`], [MakeCSS(white, error, radiusType, fontSize + 'px',)])
        }
        HR() {
            console.log('%c' + '-'.repeat(64), 'color: #aaa;')
        }
    }
    window.echo = window.echo || new echo()

    // let p = [echo.Info('Echo', echo.L), echo.Error('V0.0.1', echo.R)]
    // echo.Log(...p, 'hello')

}(window));