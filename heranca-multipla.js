    // Classe para criar herança multipla
    class multi {
        // metodo Inherit, para criar classes base/mãe
        static inherit(..._bases) {
            class classes {
                // A classe base
                get base() { return _bases; }
                constructor(..._args) {
                    var index = 0;
                    for (let b of this.base) {
                        let obj = new b(_args[index++]);
                        multi.copy(this, obj);
                    }
                }
            }
            // Copia as propriedades e metodos
            for (let base of _bases) {
                multi.copy(classes, base);
                multi.copy(classes.prototype, base.prototype);
            }
            return classes;
        }
        // Copia as propriedades de uma classe para outra
        static copy(_target, _source) {
            for (let key of Reflect.ownKeys(_source)) {
                if (key !== "constructor" && key !== "prototype" && key !== "name") {
                    let desc = Object.getOwnPropertyDescriptor(_source, key);
                    Object.defineProperty(_target, key, desc);
                }
            }
        }
    }

    class idades {
        constructor(_idade) { this.idade = _idade; }
        set idade(_i) { this._idade = _i; }
        get idade() { return this._idade; }
        increase() { this.idade++; }
    }

    class sexos {
        constructor(_sexo) { this.sexo = _sexo; }
        set sexo(_s) { this._sexo = _s; }
        get sexo() { return this._sexo; }
        male() { this._sexo = 'M'; }
        female() { this._sexo = 'F'; }
    }

    class pessoa extends multi.inherit(idades, sexos)
    {
        constructor(...args) {
            //super(1, 'M');
            this.nome = args[0];
        }
        set nome(_n) { this.nome = _n; }
        get nome() { return this._nome; }
    }
    var p = new pessoa('Pericles');
    console.log(p.nome, p.idade, p.sexo);