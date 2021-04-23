import { IWizardPage } from './IWizardPage';
import { WizardPage } from './WizardPage';
import { WizardPageDefinition, WizardPageFieldDefinition, isWizardPageFieldDefinition, isWizardPageSectionDefinition, WizardPageSectionDefinition, ValidatorResponse } from './WebviewWizard';
import { Template } from './pageImpl';
export class WebviewWizardPage extends WizardPage implements IWizardPage {
    definition:WizardPageDefinition; 
    constructor(definition: WizardPageDefinition) {
        super(definition.id, definition.title, definition.description);
        this.definition = definition;
    }
    getValidationTemplates(parameters:any) {
        let templates : Template[] = [];
        for (let key of this.definition.fields) {
            if( isWizardPageSectionDefinition(key)) {
                for (let key2 of key.childFields) {
                    templates.push({ id: key2.id + "Validation", content: "&nbsp;"});
                }
            } else if( isWizardPageFieldDefinition(key)) {
                templates.push({ id: key.id + "Validation", content: "&nbsp;"});
            }
        }
        this.setPageComplete(true);
        return this.validate(parameters, templates);
    }

    validate(parameters: any, templates:Template[]): Template[] {
        if( this.definition.validator ) {
            let resp: ValidatorResponse = this.definition.validator.call(null, parameters);
            if( resp && resp.errors && resp.errors.length > 0 ) {
                this.setPageComplete(false);
                for( let oneTemplate of resp.errors) {
                    oneTemplate.content = "<i class=\"icon icon__error\"></i>" + (oneTemplate.content ? oneTemplate.content : "");
                }
                templates = templates.concat(resp.errors);
            }
            if( resp && resp.warnings && resp.warnings.length > 0 ) {
                for( let oneTemplate of resp.warnings) {
                    oneTemplate.content = "<i class=\"icon icon__warn\"></i>" + (oneTemplate.content ? oneTemplate.content : "");
                }
                templates = templates.concat(resp.warnings);
            }
            if( resp && resp.infos && resp.infos.length > 0 ) {
                for( let oneTemplate of resp.infos) {
                    oneTemplate.content = "<i class=\"icon icon__info\"></i>" + (oneTemplate.content ? oneTemplate.content : "");
                }
                templates = templates.concat(resp.infos);
            }
            if( resp && resp.other && resp.other.length > 0 ) {
                templates = templates.concat(resp.other);
            }
        }
        return templates;
    }

    getContentAsHTML(data: any): string {
        let ret = "";
        for( let oneField of this.definition.fields ) {
            if( isWizardPageSectionDefinition(oneField)) {
                ret += this.oneSectionAsString(oneField, data);
            } else if( isWizardPageFieldDefinition(oneField)) {
                ret += this.oneFieldAsString(oneField, data);
            }
        }
        return ret;
    }

    oneSectionAsString(oneSection:WizardPageSectionDefinition, data: any) {
        let ret = "";
        let onclick = " onclick=\"document.getElementById('" + oneSection.id + "').classList.toggle('collapsed');\"";
        //let onclick = " onclick=\"console.log('test1')\"";

        ret += "<section id=\"" + oneSection.id + "\" class=\"section--settings section--collapsible\"" + ">\n";
        ret += "        <div class=\"section__header\" " + onclick + ">\n";
        ret += "                <h2>" + oneSection.label + "</h2>\n";
        if( oneSection.description ) {
            ret += "                <p class=\"section__header-hint\">" + oneSection.description + "</p>\n";
        }
        ret += "        </div>\n";
        ret += "        <div class=\"section__collapsible\">\n";
        ret += "           <div class=\"section__group\">\n";
        ret += "                <div class=\"section__content\">\n";

        for( let oneField of oneSection.childFields ) {
            ret += this.oneFieldAsString(oneField, data);
        }


        ret += "                </div>\n";
        ret += "           </div>\n";
        ret += "        </div>\n";
        ret += "</section>\n";
        return ret;
    }

    oneFieldAsString(oneField: WizardPageFieldDefinition, data: any) : string {
        let ret = "";
        if( oneField.type === "textbox") {
            ret = ret + this.textBoxAsHTML(oneField, data);
        } else if( oneField.type === "checkbox") {
            ret = ret + this.checkBoxAsHTML(oneField, data);
        } else if( oneField.type === "number") {
            ret = ret + this.numberAsHTML(oneField, data);
        } else if( oneField.type === "textarea") {
            ret = ret + this.textAreaAsHTML(oneField, data);
        } else if( oneField.type === "radio") {
            ret = ret + this.radioGroupAsHTML(oneField, data);
        } else if( oneField.type === "select") {
            ret = ret + this.selectAsHTML(oneField, data);
        } else if( oneField.type === "combo") {
            ret = ret + this.comboAsHTML(oneField, data);
        }
        return this.divClass("setting", 0, ret);
    }

    textBoxAsHTML(oneField: WizardPageFieldDefinition, data: any): string {
        let iv = this.getInitialValue(oneField, data);

        let lbl = this.labelFor(oneField.id, oneField.label,0);
        let initialValueSegment = oneField.initialValue ? " value=\"" + oneField.initialValue + "\"" : "";
        let placeholderSegment = !oneField.initialValue && oneField.placeholder ? " placeholder=\"" + oneField.placeholder + "\"" : "";
        
        let input = "<input id=\"" + oneField.id + "\" name=\"" + oneField.id + "\" type=\"text\"" 
                + (iv ? "value=\"" + iv + "\"" : "")
                + initialValueSegment + placeholderSegment + this.onInputFieldChanged(oneField.id) + " data-setting data-setting-preview>";
        let validationDiv =  this.validationDiv(oneField.id, 0);

        let inner = lbl + input + validationDiv;
        let settingInput:string = this.divClass("setting__input",0, inner);

        let hint = "<p class=\"setting__hint\">" + 
                (oneField.description ? oneField.description : "") 
                + "</p>";

        return settingInput + hint;
    }


    numberAsHTML(oneField: WizardPageFieldDefinition, data: any): string {
        let iv = this.getInitialValue(oneField, data);

        let lbl = this.labelFor(oneField.id, oneField.label,0);
        let initialValueSegment = oneField.initialValue ? " value=\"" + oneField.initialValue + "\"" : "";
        let placeholderSegment = !oneField.initialValue && oneField.placeholder ? " placeholder=\"" + oneField.placeholder + "\"" : "";
        
        let input = "<input id=\"" + oneField.id + "\" name=\"" + oneField.id + "\" type=\"number\"" 
                + (iv ? "value=\"" + iv + "\"" : "")
                + initialValueSegment + placeholderSegment + this.onInputFieldChanged(oneField.id) + " data-setting data-setting-preview>";
        let validationDiv =  this.validationDiv(oneField.id, 0);

        let inner = lbl + input + validationDiv;
        let settingInput:string = this.divClass("setting__input",0, inner);

        let hint = "<p class=\"setting__hint\">" + 
                (oneField.description ? oneField.description : "") 
                + "</p>";

        return settingInput + hint;
    }

    checkBoxAsHTML(oneField: WizardPageFieldDefinition, data: any): string {
        let iv = this.getInitialValue(oneField, data);
        let lbl = this.labelFor(oneField.id, oneField.label,0);
        let validationDiv =  this.validationDiv(oneField.id, 0);

        // create the input item
        let fieldChangedArg2 = " document.getElementById('" + oneField.id + "').checked";
        let oninput =  this.onInputFieldChangedWithValue(oneField.id, fieldChangedArg2);
        let checked = (iv ? " checked" : "");
        let input = "<input id=\"" + oneField.id + "\" name=\"" + oneField.id + "\" type=\"checkbox\"" 
                +oninput + " data-setting data-setting-preview" + checked + ">";

        let inner = input + lbl + validationDiv;
        let settingInput:string = this.divClass("setting__input",0, inner);

        let hint = "<p class=\"setting__hint\">" + (oneField.description ? oneField.description : "") + "</p>";

        return settingInput + hint;
    }

    textAreaAsHTML(oneField: WizardPageFieldDefinition, data: any): string {
        let cols = (oneField.properties && oneField.properties.columns ? " cols=\"" + oneField.properties.columns + "\"" : "");
        let rows = (oneField.properties && oneField.properties.rows ? " rows=\"" + oneField.properties.rows + "\"" : "");
        let iv = this.getInitialValue(oneField, data);
        let lbl = this.labelFor(oneField.id, oneField.label,0);



        let placeholder = (!oneField.initialValue && oneField.placeholder ? 
                " placeholder=\"" + oneField.placeholder + "\"" : "");


        let oninput = this.onInputFieldChanged(oneField.id);
        let textarea = "<textarea id=\"" + oneField.id + "\" name=\"" + oneField.id + "\" " 
            + cols + rows + oninput + placeholder + " data-setting data-setting-preview>";
        if( iv ) {
            textarea += iv;
        }
        textarea = textarea + "</textarea>\n";
        let validationDiv = this.validationDiv(oneField.id, 0);

        let inner =  lbl + textarea + validationDiv;
        let settingInput:string = this.divClass("setting__input",0, inner);

        let hint = "<p class=\"setting__hint\">" + (oneField.description ? oneField.description : "") + "</p>";
        return settingInput + hint;
    }


    radioGroupAsHTML(oneField: WizardPageFieldDefinition, data: any): string {
        let iv = this.getInitialValue(oneField, data);
        let label = this.labelFor(oneField.id, oneField.label,0);


        let inputs = "";
        if( oneField.properties && oneField.properties?.options) {
            for( let oneOpt of oneField.properties?.options ) {
                let selected: boolean = iv ? (iv === oneOpt) : false;
                let oninput = this.onInputFieldChangedWithValue(oneField.id, "'" + oneOpt + "'");
                inputs = inputs + "<input type=\"radio\" name=\"" + oneField.id + 
                                        "\" id=\"" + oneOpt + 
                                        oninput +
                                        (selected ? " checked" : "") +
                                        ">\n";
                inputs += this.labelFor(oneOpt, oneOpt,0);
            }
        }

        let inputContainer = this.divClass("select-container", 0, inputs);

        let validationDiv = this.validationDiv(oneField.id, 0);
        let settingInput:string = this.divClass("setting__input",0, label + inputContainer + validationDiv);
        let hint = "<p class=\"setting__hint\">" + (oneField.description ? oneField.description : "") + "</p>";
        return settingInput + hint;
    }


    selectAsHTML(oneField: WizardPageFieldDefinition, data: any): string {
        let iv = this.getInitialValue(oneField, data);
        let label : string = this.labelFor(oneField.id, oneField.label,0);
        let oninput = this.onInputFieldChanged(oneField.id);

        // Create the select
        let select = "<select name=\"" + oneField.id + "\" id=\"" + oneField.id + "\""
            + oninput + " data-setting>\n";
        if( oneField.properties && oneField.properties?.options) {
            for( let oneOpt of oneField.properties?.options ) {
                let selected: boolean = iv ? (iv === oneOpt) : false;
                select = select + "   <option" + (selected ? " selected" : "") + ">" + oneOpt + "</option>\n";
            }
        }
        select += "</select>\n";

        let selectContainer = this.divClass("select-container", 0, select);

        let validationDiv = this.validationDiv(oneField.id, 0);
        let settingInput:string = this.divClass("setting__input",0, label + selectContainer + validationDiv);
        let hint = "<p class=\"setting__hint\">" + (oneField.description ? oneField.description : "") + "</p>";
        return settingInput + hint;
    }

    comboAsHTML(oneField: WizardPageFieldDefinition, data: any): string {
        if( !oneField.optionProvider && (!oneField.properties || !oneField.properties.options)) {
            return this.textBoxAsHTML(oneField, data);
        } 

        let iv = this.getInitialValue(oneField, data);
        let label : string = this.labelFor(oneField.id, oneField.label,0);
        let oninput = this.onInputFieldChanged(oneField.id);

        // actual combo here
        let text : string =  "<input type=\"text\" name=\"" + oneField.id + "\" " + 
                                "list=\"" + oneField.id + "InternalList\" " + 
                                "id=\"" + oneField.id + "\"" + 
                                (iv ? "value=\"" + iv + "\"" : "") + 
                                oninput + ")\"/>\n";
        let dataList : string = "<datalist id=\"" + oneField.id + "InternalList\">";
        let optList = null;
        if( oneField.optionProvider ) {
            optList = oneField.optionProvider(data);
        }
        if( optList === null && oneField.properties && oneField.properties.options) {
            optList = oneField.properties?.options;
        }

        for( let oneOpt of optList ) {
            let selected: boolean = iv ? (iv === oneOpt) : false;
            dataList = dataList + "   <option value=\"" + oneOpt + "\"" + (selected ? " selected" : "") + ">\n";
        }
        dataList = dataList + "</datalist>\n";


        let validationDiv = this.validationDiv(oneField.id, 0);
        let settingInput:string = this.divClass("setting__input",0, label + text + dataList + validationDiv);
        let hint = "<p class=\"setting__hint\">" + (oneField.description ? oneField.description : "") + "</p>";
        return settingInput + hint;
    }


    onInputFieldChanged(id:string):string {
        return  " oninput=\"fieldChanged('" + id + "')\" ";
    }
    onInputFieldChangedWithValue(id:string, val:string):string {
        return " oninput=\"fieldChangedWithVal('" + id + "', " + val + ")\"";
    }
    validationDiv(id:string, tabs:number):string {
        let tabss:string = this.numTabs(tabs);
        return  tabss + "<div id=\"" + id + "Validation\">&nbsp;</div>\n";
    }
    labelFor(fieldId:string, labelVal:string, tabs:number): string {
        let tabss:string = this.numTabs(tabs);
        return tabss + "<label for=\"" + fieldId + "\">" + labelVal + "</label>\n";
    }
    divClass(classname: string, tabs: number, inner: string): string {
        let tabss:string = this.numTabs(tabs);
        return tabss + "<div class=\"" + classname + "\">\n" + inner + tabss + "</div>\n";
    }
    numTabs(num: number): string {
        let ret: string = "";
        for( let i:number = 0; i < num; i++ ) {
            ret += "\t";
        }
        return ret;
    }

    getInitialValue(oneField: WizardPageFieldDefinition, data: any) : string { 
        if( data instanceof Map ) {
            return data && data.get(oneField.id) ? data.get(oneField.id) : oneField.initialValue;
        }
        return data && data[oneField.id] ? data[oneField.id] : oneField.initialValue;
    }

}