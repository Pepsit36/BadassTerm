import envVars from '../../../envVars';

export default new class Config {
    private readonly envVars: string[];

    constructor() {
        this.envVars = [];
        for (const envVarName in envVars) {
            this.envVars[envVarName] = process.env[envVarName] || envVars[envVarName];
        }
    }

    private get(name: string) {
        return this.envVars[name];
    }

    public getString(name: string): string {
        return String(this.envVars[name]);
    }

    public getNumber(name: string): number {
        return parseInt(this.get(name));
    }

    public getBoolean(name: string): boolean {
        const value = this.get(name);
        return value === 'true' || value === true;
    }
};
