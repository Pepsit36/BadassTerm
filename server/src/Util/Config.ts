import envVars from '../../../envVars';

export default new class Config {
    private readonly envVars: string[];

    constructor() {
        this.envVars = [];
        for (const envVarName in envVars) {
            this.envVars[envVarName] = process.env[envVarName] || envVars[envVarName];
        }
    }

    get(name: string): string {
        return this.envVars[name];
    }

    getNumber(name: string): number {
        return parseInt(this.get(name));
    }
};