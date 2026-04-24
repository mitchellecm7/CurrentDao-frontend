// Data Mapper Utility
// Handles data transformation and mapping between different provider formats

export interface DataMappingRule {
  id: string;
  sourceProvider: string;
  targetProvider: string;
  sourceFormat: string;
  targetFormat: string;
  fieldMappings: Array<{
    sourceField: string;
    targetField: string;
    transform?: string; // transformation function name
    defaultValue?: any;
  }>;
  filters?: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
    value: any;
  }>;
  enabled: boolean;
}

export interface TransformedData {
  originalData: any;
  transformedData: any;
  mappingRule: DataMappingRule;
  transformationLog: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    transformation: string;
  }>;
  errors: Array<{
    field: string;
    error: string;
  }>;
}

export interface DataValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'custom';
  field: string;
  parameters: {
    format?: string; // for format validation
    min?: number; // for range validation
    max?: number; // for range validation
    customFunction?: string; // for custom validation
    errorMessage?: string;
  };
  enabled: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    rule: string;
    message: string;
    value: any;
  }>;
  warnings: Array<{
    field: string;
    rule: string;
    message: string;
    value: any;
  }>;
}

export interface DataNormalizationConfig {
  timestampFields: string[];
  numericFields: string[];
  booleanFields: string[];
  enumFields: Record<string, string[]>;
  unitConversions: Record<string, {
    from: string;
    to: string;
    factor: number;
  }>;
}

class DataMapperService {
  private mappingRules: Map<string, DataMappingRule> = new Map();
  private validationRules: Map<string, DataValidationRule> = new Map();
  private normalizationConfig: DataNormalizationConfig;

  constructor() {
    this.normalizationConfig = {
      timestampFields: ['timestamp', 'createdAt', 'updatedAt', 'lastSeen', 'date'],
      numericFields: ['value', 'temperature', 'humidity', 'pressure', 'consumption', 'generation'],
      booleanFields: ['isOn', 'isActive', 'connected', 'online', 'enabled'],
      enumFields: {
        status: ['online', 'offline', 'error', 'maintenance'],
        priority: ['low', 'medium', 'high', 'critical'],
        type: ['sensor', 'actuator', 'gateway', 'controller'],
      },
      unitConversions: {
        temperature: { from: 'F', to: 'C', factor: 5/9 },
        energy: { from: 'Wh', to: 'kWh', factor: 0.001 },
        power: { from: 'W', to: 'kW', factor: 0.001 },
        pressure: { from: 'psi', to: 'Pa', factor: 6894.76 },
      },
    };

    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Energy Provider Mapping Rules
    const energyMappings: DataMappingRule[] = [
      {
        id: 'pge-to-standard',
        sourceProvider: 'pge',
        targetProvider: 'standard',
        sourceFormat: 'pge_api',
        targetFormat: 'currentdao',
        fieldMappings: [
          { sourceField: 'current_price', targetField: 'pricing.currentPrice' },
          { sourceField: 'currency', targetField: 'pricing.currency' },
          { sourceField: 'consumption_kw', targetField: 'consumption.current', transform: 'multiply', defaultValue: 1000 },
          { sourceField: 'timestamp', targetField: 'timestamp', transform: 'parseDate' },
          { sourceField: 'grid_load_mw', targetField: 'gridStatus.load', transform: 'multiply', defaultValue: 1000 },
          { sourceField: 'grid_capacity_mw', targetField: 'gridStatus.capacity', transform: 'multiply', defaultValue: 1000 },
        ],
        enabled: true,
      },
      {
        id: 'tesla-to-standard',
        sourceProvider: 'tesla-energy',
        targetProvider: 'standard',
        sourceFormat: 'tesla_api',
        targetFormat: 'currentdao',
        fieldMappings: [
          { sourceField: 'solar_power', targetField: 'generation.solar' },
          { sourceField: 'battery_power', targetField: 'generation.battery' },
          { sourceField: 'grid_power', targetField: 'consumption.current', transform: 'abs' },
          { sourceField: 'timestamp', targetField: 'timestamp', transform: 'parseDate' },
        ],
        enabled: true,
      },
    ];

    // Weather Provider Mapping Rules
    const weatherMappings: DataMappingRule[] = [
      {
        id: 'openweather-to-standard',
        sourceProvider: 'openweathermap',
        targetProvider: 'standard',
        sourceFormat: 'openweather_api',
        targetFormat: 'currentdao',
        fieldMappings: [
          { sourceField: 'main.temp', targetField: 'current.temperature' },
          { sourceField: 'main.feels_like', targetField: 'current.feelsLike' },
          { sourceField: 'main.humidity', targetField: 'current.humidity' },
          { sourceField: 'main.pressure', targetField: 'current.pressure' },
          { sourceField: 'wind.speed', targetField: 'current.windSpeed' },
          { sourceField: 'wind.deg', targetField: 'current.windDirection' },
          { sourceField: 'dt', targetField: 'timestamp', transform: 'parseUnixTimestamp' },
          { sourceField: 'weather[0].description', targetField: 'current.condition' },
        ],
        enabled: true,
      },
      {
        id: 'weatherapi-to-standard',
        sourceProvider: 'weatherapi',
        targetProvider: 'standard',
        sourceFormat: 'weatherapi_api',
        targetFormat: 'currentdao',
        fieldMappings: [
          { sourceField: 'temp_c', targetField: 'current.temperature' },
          { sourceField: 'feelslike_c', targetField: 'current.feelsLike' },
          { sourceField: 'humidity', targetField: 'current.humidity' },
          { sourceField: 'pressure_mb', targetField: 'current.pressure' },
          { sourceField: 'wind_kph', targetField: 'current.windSpeed', transform: 'kphToMs' },
          { sourceField: 'wind_degree', targetField: 'current.windDirection' },
          { sourceField: 'last_updated', targetField: 'timestamp', transform: 'parseDateString' },
          { sourceField: 'condition.text', targetField: 'current.condition' },
        ],
        enabled: true,
      },
    ];

    // Smart Home Provider Mapping Rules
    const smartHomeMappings: DataMappingRule[] = [
      {
        id: 'google-home-to-standard',
        sourceProvider: 'google-home',
        targetProvider: 'standard',
        sourceFormat: 'google_home_api',
        targetFormat: 'currentdao',
        fieldMappings: [
          { sourceField: 'name', targetField: 'name' },
          { sourceField: 'type', targetField: 'type' },
          { sourceField: 'traits.OnOff.on', targetField: 'isOn' },
          { sourceField: 'traits.Brightness.brightness', targetField: 'currentState.brightness', transform: 'percentageToDecimal' },
          { sourceField: 'traits.TemperatureSetting.ambientTemperatureCelsius', targetField: 'currentState.temperature' },
          { sourceField: 'lastUpdateTime', targetField: 'lastUpdated', transform: 'parseDate' },
        ],
        enabled: true,
      },
      {
        id: 'alexa-to-standard',
        sourceProvider: 'alexa',
        targetProvider: 'standard',
        sourceFormat: 'alexa_api',
        targetFormat: 'currentdao',
        fieldMappings: [
          { sourceField: 'friendlyName', targetField: 'name' },
          { sourceField: 'capabilities', targetField: 'capabilities' },
          { sourceField: 'powerState', targetField: 'isOn', transform: 'stringToBoolean' },
          { sourceField: 'brightness.value', targetField: 'currentState.brightness', transform: 'percentageToDecimal' },
          { sourceField: 'temperature.value', targetField: 'currentState.temperature' },
          { sourceField: 'lastSeen', targetField: 'lastUpdated', transform: 'parseDate' },
        ],
        enabled: true,
      },
    ];

    // IoT Device Mapping Rules
    const iotMappings: DataMappingRule[] = [
      {
        id: 'mqtt-sensor-to-standard',
        sourceProvider: 'mqtt',
        targetProvider: 'standard',
        sourceFormat: 'mqtt_json',
        targetFormat: 'currentdao',
        fieldMappings: [
          { sourceField: 'device_id', targetField: 'deviceId' },
          { sourceField: 'sensor_type', targetField: 'type' },
          { sourceField: 'value', targetField: 'data.readings[0].value' },
          { sourceField: 'unit', targetField: 'data.readings[0].unit' },
          { sourceField: 'timestamp', targetField: 'data.readings[0].timestamp', transform: 'parseUnixTimestamp' },
          { sourceField: 'location.lat', targetField: 'location.latitude' },
          { sourceField: 'location.lon', targetField: 'location.longitude' },
        ],
        enabled: true,
      },
    ];

    // Add all mappings to the rules map
    [...energyMappings, ...weatherMappings, ...smartHomeMappings, ...iotMappings].forEach(rule => {
      this.mappingRules.set(rule.id, rule);
    });

    // Initialize validation rules
    const validationRules: DataValidationRule[] = [
      {
        id: 'required-timestamp',
        name: 'Timestamp Required',
        type: 'required',
        field: 'timestamp',
        parameters: { errorMessage: 'Timestamp is required' },
        enabled: true,
      },
      {
        id: 'temperature-range',
        name: 'Temperature Range',
        type: 'range',
        field: 'temperature',
        parameters: { min: -50, max: 100, errorMessage: 'Temperature must be between -50°C and 100°C' },
        enabled: true,
      },
      {
        id: 'humidity-range',
        name: 'Humidity Range',
        type: 'range',
        field: 'humidity',
        parameters: { min: 0, max: 100, errorMessage: 'Humidity must be between 0% and 100%' },
        enabled: true,
      },
      {
        id: 'energy-positive',
        name: 'Energy Positive',
        type: 'custom',
        field: 'consumption',
        parameters: { 
          customFunction: 'validatePositiveNumber',
          errorMessage: 'Energy consumption must be positive' 
        },
        enabled: true,
      },
    ];

    validationRules.forEach(rule => {
      this.validationRules.set(rule.id, rule);
    });
  }

  // Data Transformation
  transformData(data: any, ruleId: string): TransformedData {
    const rule = this.mappingRules.get(ruleId);
    if (!rule) {
      throw new Error(`Mapping rule with id ${ruleId} not found`);
    }

    if (!rule.enabled) {
      return {
        originalData: data,
        transformedData: data,
        mappingRule: rule,
        transformationLog: [],
        errors: [{ field: 'rule', error: 'Mapping rule is disabled' }],
      };
    }

    const transformationLog: Array<{ field: string; oldValue: any; newValue: any; transformation: string }> = [];
    const errors: Array<{ field: string; error: string }> = [];
    let transformedData = { ...data };

    // Apply filters first
    if (rule.filters) {
      for (const filter of rule.filters) {
        if (!this.applyFilter(transformedData, filter)) {
          return {
            originalData: data,
            transformedData: null,
            mappingRule: rule,
            transformationLog: [],
            errors: [{ field: filter.field, error: 'Data filtered out' }],
          };
        }
      }
    }

    // Apply field mappings
    for (const mapping of rule.fieldMappings) {
      try {
        const sourceValue = this.getNestedValue(data, mapping.sourceField);
        
        if (sourceValue !== undefined && sourceValue !== null) {
          let transformedValue = sourceValue;

          // Apply transformation if specified
          if (mapping.transform) {
            transformedValue = this.applyTransformation(sourceValue, mapping.transform, mapping.defaultValue);
            transformationLog.push({
              field: mapping.targetField,
              oldValue: sourceValue,
              newValue: transformedValue,
              transformation: mapping.transform,
            });
          }

          // Set nested value
          this.setNestedValue(transformedData, mapping.targetField, transformedValue);
        } else if (mapping.defaultValue !== undefined) {
          this.setNestedValue(transformedData, mapping.targetField, mapping.defaultValue);
          transformationLog.push({
            field: mapping.targetField,
            oldValue: undefined,
            newValue: mapping.defaultValue,
            transformation: 'default',
          });
        }
      } catch (error) {
        errors.push({
          field: mapping.sourceField,
          error: error instanceof Error ? error.message : 'Unknown transformation error',
        });
      }
    }

    // Normalize data
    transformedData = this.normalizeData(transformedData);

    return {
      originalData: data,
      transformedData,
      mappingRule: rule,
      transformationLog,
      errors,
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      // Handle array notation like 'weather[0].description'
      const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        return current?.[arrayKey]?.[parseInt(index)];
      }
      return current?.[key];
    }, obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  private applyFilter(data: any, filter: DataMappingRule['filters'][0]): boolean {
    const value = this.getNestedValue(data, filter.field);
    
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'not_equals':
        return value !== filter.value;
      case 'greater_than':
        return value > filter.value;
      case 'less_than':
        return value < filter.value;
      case 'contains':
        return typeof value === 'string' && value.includes(filter.value);
      case 'regex':
        return new RegExp(filter.value).test(String(value));
      default:
        return true;
    }
  }

  private applyTransformation(value: any, transform: string, defaultValue?: any): any {
    switch (transform) {
      case 'parseDate':
        return value instanceof Date ? value : new Date(value);
      case 'parseUnixTimestamp':
        return new Date(value * 1000);
      case 'parseDateString':
        return new Date(value);
      case 'multiply':
        return defaultValue ? value * defaultValue : value;
      case 'abs':
        return Math.abs(value);
      case 'stringToBoolean':
        return value === 'true' || value === true || value === 1;
      case 'percentageToDecimal':
        return value / 100;
      case 'kphToMs':
        return value * 0.277778;
      case 'fahrenheitToCelsius':
        return (value - 32) * 5/9;
      case 'celsiusToFahrenheit':
        return (value * 9/5) + 32;
      default:
        return value;
    }
  }

  private normalizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const normalized = { ...data };

    // Normalize timestamps
    this.normalizationConfig.timestampFields.forEach(field => {
      const value = this.getNestedValue(normalized, field);
      if (value && !(value instanceof Date)) {
        this.setNestedValue(normalized, field, new Date(value));
      }
    });

    // Normalize numeric fields
    this.normalizationConfig.numericFields.forEach(field => {
      const value = this.getNestedValue(normalized, field);
      if (value !== undefined && value !== null) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          this.setNestedValue(normalized, field, numValue);
        }
      }
    });

    // Normalize boolean fields
    this.normalizationConfig.booleanFields.forEach(field => {
      const value = this.getNestedValue(normalized, field);
      if (value !== undefined && value !== null) {
        const boolValue = Boolean(value);
        this.setNestedValue(normalized, field, boolValue);
      }
    });

    // Normalize enum fields
    Object.entries(this.normalizationConfig.enumFields).forEach(([field, validValues]) => {
      const value = this.getNestedValue(normalized, field);
      if (value && validValues.includes(value)) {
        this.setNestedValue(normalized, field, value.toLowerCase());
      }
    });

    return normalized;
  }

  // Data Validation
  validateData(data: any, ruleIds?: string[]): ValidationResult {
    const rulesToApply = ruleIds 
      ? ruleIds.map(id => this.validationRules.get(id)).filter(Boolean) as DataValidationRule[]
      : Array.from(this.validationRules.values()).filter(rule => rule.enabled);

    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    for (const rule of rulesToApply) {
      try {
        const result = this.applyValidationRule(data, rule);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } catch (error) {
        errors.push({
          field: rule.field,
          rule: rule.name,
          message: error instanceof Error ? error.message : 'Validation error',
          value: this.getNestedValue(data, rule.field),
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private applyValidationRule(data: any, rule: DataValidationRule): ValidationResult {
    const value = this.getNestedValue(data, rule.field);
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          errors.push({
            field: rule.field,
            rule: rule.name,
            message: rule.parameters.errorMessage || `${rule.field} is required`,
            value,
          });
        }
        break;

      case 'format':
        if (value && rule.parameters.format) {
          const regex = new RegExp(rule.parameters.format);
          if (!regex.test(String(value))) {
            errors.push({
              field: rule.field,
              rule: rule.name,
              message: rule.parameters.errorMessage || `${rule.field} format is invalid`,
              value,
            });
          }
        }
        break;

      case 'range':
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          if (rule.parameters.min !== undefined && numValue < rule.parameters.min) {
            errors.push({
              field: rule.field,
              rule: rule.name,
              message: rule.parameters.errorMessage || `${rule.field} is below minimum value`,
              value,
            });
          }
          if (rule.parameters.max !== undefined && numValue > rule.parameters.max) {
            errors.push({
              field: rule.field,
              rule: rule.name,
              message: rule.parameters.errorMessage || `${rule.field} is above maximum value`,
              value,
            });
          }
        }
        break;

      case 'custom':
        if (rule.parameters.customFunction) {
          const isValid = this.applyCustomValidation(value, rule.parameters.customFunction);
          if (!isValid) {
            errors.push({
              field: rule.field,
              rule: rule.name,
              message: rule.parameters.errorMessage || `${rule.field} validation failed`,
              value,
            });
          }
        }
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private applyCustomValidation(value: any, functionName: string): boolean {
    switch (functionName) {
      case 'validatePositiveNumber':
        return Number(value) > 0;
      case 'validateEmail':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      case 'validateUrl':
        try {
          new URL(String(value));
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  // Mapping Rule Management
  addMappingRule(rule: DataMappingRule): void {
    this.mappingRules.set(rule.id, rule);
  }

  removeMappingRule(ruleId: string): boolean {
    return this.mappingRules.delete(ruleId);
  }

  updateMappingRule(ruleId: string, updates: Partial<DataMappingRule>): boolean {
    const existingRule = this.mappingRules.get(ruleId);
    if (!existingRule) return false;

    const updatedRule = { ...existingRule, ...updates };
    this.mappingRules.set(ruleId, updatedRule);
    return true;
  }

  getMappingRule(ruleId: string): DataMappingRule | undefined {
    return this.mappingRules.get(ruleId);
  }

  getAllMappingRules(): DataMappingRule[] {
    return Array.from(this.mappingRules.values());
  }

  getMappingRulesByProvider(provider: string): DataMappingRule[] {
    return Array.from(this.mappingRules.values()).filter(
      rule => rule.sourceProvider === provider || rule.targetProvider === provider
    );
  }

  // Validation Rule Management
  addValidationRule(rule: DataValidationRule): void {
    this.validationRules.set(rule.id, rule);
  }

  removeValidationRule(ruleId: string): boolean {
    return this.validationRules.delete(ruleId);
  }

  updateValidationRule(ruleId: string, updates: Partial<DataValidationRule>): boolean {
    const existingRule = this.validationRules.get(ruleId);
    if (!existingRule) return false;

    const updatedRule = { ...existingRule, ...updates };
    this.validationRules.set(ruleId, updatedRule);
    return true;
  }

  getValidationRule(ruleId: string): DataValidationRule | undefined {
    return this.validationRules.get(ruleId);
  }

  getAllValidationRules(): DataValidationRule[] {
    return Array.from(this.validationRules.values());
  }

  // Utility Methods
  exportMappingRules(): string {
    const rules = Array.from(this.mappingRules.values());
    return JSON.stringify(rules, null, 2);
  }

  importMappingRules(rulesJson: string): void {
    try {
      const rules: DataMappingRule[] = JSON.parse(rulesJson);
      rules.forEach(rule => this.addMappingRule(rule));
    } catch (error) {
      throw new Error('Failed to import mapping rules: Invalid JSON format');
    }
  }

  exportValidationRules(): string {
    const rules = Array.from(this.validationRules.values());
    return JSON.stringify(rules, null, 2);
  }

  importValidationRules(rulesJson: string): void {
    try {
      const rules: DataValidationRule[] = JSON.parse(rulesJson);
      rules.forEach(rule => this.addValidationRule(rule));
    } catch (error) {
      throw new Error('Failed to import validation rules: Invalid JSON format');
    }
  }

  // Batch Operations
  transformBatch(dataArray: any[], ruleId: string): TransformedData[] {
    return dataArray.map(data => this.transformData(data, ruleId));
  }

  validateBatch(dataArray: any[], ruleIds?: string[]): ValidationResult[] {
    return dataArray.map(data => this.validateData(data, ruleIds));
  }

  // Schema Generation
  generateSchema(ruleId: string): any {
    const rule = this.mappingRules.get(ruleId);
    if (!rule) return null;

    const schema: any = {
      type: 'object',
      properties: {},
    };

    rule.fieldMappings.forEach(mapping => {
      const pathParts = mapping.targetField.split('.');
      let current = schema.properties;

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = { type: 'object', properties: {} };
        }
        current = current[part].properties;
      }

      const finalPart = pathParts[pathParts.length - 1];
      current[finalPart] = {
        type: this.inferType(mapping.transform),
        description: `Mapped from ${mapping.sourceField}`,
      };
    });

    return schema;
  }

  private inferType(transform?: string): string {
    if (transform?.includes('Date') || transform?.includes('Timestamp')) {
      return 'string';
    }
    if (transform === 'stringToBoolean' || transform === 'percentageToDecimal') {
      return 'number';
    }
    return 'string';
  }
}

// Singleton instance
export const dataMapperService = new DataMapperService();

export default dataMapperService;
