const raw_core = require('momentum-token/color/core.json');
const args = require('args-parser')(process.argv);
const path = require('path');
const write = require('write');

const tool = {
    getOrderedValues:(colors)=> {
        const orderedColors=[];
        Object.keys(colors).map((n)=>{
            return +n;
        }).sort().forEach((key)=>{
            orderedColors.push(colors[key]);
        });
        return orderedColors;
    },
    toRgbaStr:(color)=> {
        return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
    }
};

class CoreGenerate {

    path_folder = path.resolve(__dirname,'../core/color');
    dry_path_folder;

    constructor() {
        this.path_folder = args.dry ? path.resolve(__dirname,'../dist/_core/color') : path.resolve(__dirname,'../core/color');
    
    }

    getGroup(data) {
        const ret = {};
        Object.keys(data).forEach((key)=>{
            const names = key.split('-');
            if(names.length>3) {
                const lv1 = names[2];
                const lv2  = names[3];
                if(ret[lv1]==undefined) {
                    ret[lv1]={};
                }
                if(data[key].colors) {
                    const _colors = tool.getOrderedValues(data[key].colors);
                    ret[lv1][lv2] = _colors.map((col)=>{
                        return col.hex;
                    });
                } else {
                    ret[lv1][lv2] = data[key].hex;
                }
            }
        });
        return ret;
    }

    getColorNode(data) {
        const ret = {};
        Object.keys(data).forEach((key) => {
            ret[key] = this.getGroup(data[key]);
        });
        return ret;
    }

    getBaseColorNode(name, data){
        const ret = {};
        const ifUseRgba = ['white-alpha','black-alpha'].indexOf(name)!==-1;
        Object.keys(data).forEach((key)=>{
            const _key = key.replace(`${name}-`,'');
            ret[_key] = ifUseRgba ? tool.toRgbaStr(data[key]) : data[key].hex;
        });
        return ret;
    }

    getCoreColorNode(source, data) {
        Object.keys(data).forEach((key)=>{
            source[key] = this.getBaseColorNode(key, data[key]);
        });
        return source
    }

    getContent(data) {
        return JSON.stringify({ 
            color: data 
        },null,'  ');
    }

    generate(data) {
        const coreContent = this.getCoreColorNode({
            "transparent": "rgba(255, 255, 255, 0)"
        },data['core color']);
        const decorativeColorContent = this.getCoreColorNode({},data['decorative color']);
        const solidContent = { solid: this.getColorNode(data['mobile solid background']) };
        const gradationContent = { gradation: this.getColorNode(data['gradation color'])};

        write.sync(path.join(this.path_folder, 'functional.json'), this.getContent(coreContent));
        write.sync(path.join(this.path_folder, 'decorative.json'), this.getContent(decorativeColorContent));
        write.sync(path.join(this.path_folder, 'solids.json'), this.getContent(solidContent));
        write.sync(path.join(this.path_folder, 'gradation.json'), this.getContent(gradationContent));
    }
};

const core = new CoreGenerate();
core.generate(raw_core);

