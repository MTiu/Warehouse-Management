/**
 * Author: Arjhay Frias
 * Created_at: 03/31/2022
 * Updated_at: 04/09/2022
 * 
 * Description: The Validator can validate user inputs
 * 
 */

 class Validator {
    errors = {};
    field_name = '';
    string = '';

    /**DOCU: Checks if string contains non Alpha characters */
    isAlpha() {
        const pattern = /^[a-zA-Z]+$/;

        if(!this.string.match(pattern)) {
            this.errors[this.field_name] = `${this.field_name} must not contain any numbers`;
        }

        return this;
    }

    /**DOCU: Checks if string contains non Alpha characters */
    isNum() {
        const pattern = /^[0-9]+$/;

        if(!this.string.match(pattern)) {
            this.errors[this.field_name] = `${this.field_name} must not contain any alpha or special characters`;
        }

        return this;
    }

    /**DOCU: Sets field name and string used for validation this.errors */
    setField(field_name, string) {
        this.field_name = field_name;
        this.string = string;

        return this;
    }

    /**DOCU: Checks if string is empty */
    isEmpty() {
        if(this.string.length <= 0) {
            this.errors[this.field_name] = `${this.field_name} must not be empty`;
        }

        return this;
    }

    /**DOCU: Checks if length pass min and max requirement
     * both are optional. 
     */
    isLength(map_length) {
        if(this.string.length < map_length.min) {
            this.errors[this.field_name] = `${this.field_name} length must be atleast ${map_length.min} characters long`;
        }

        if(this.string.length > map_length.max) {
            this.errors[this.field_name] = `${this.field_name} length must not exceed ${map_length.max} characters long`;
        }

        return this;
    }

    /**DOCU: Checks if string is a valid Email */
    isEmail() {
        const pattern = /\S+@\S+\.\S+/;

        if(!this.string.match(pattern)) {
            this.errors[this.field_name] = `${this.field_name} must be a valid email`;
        }

        return this;
    }

    /**DOCU: Checks if string is as argument string */
    isSame(string) {
        if(this.string !== string) {
            this.errors[this.field_name] = `${this.field_name} does not match`;
        }

        return this;
    }

    validationErrors() {
        const err = this.errors;
        this.errors = {};
        return err;
    }
}

module.exports = new Validator();