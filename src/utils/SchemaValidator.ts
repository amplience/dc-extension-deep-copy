import Ajv, { ErrorObject, ValidateFunction } from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import {
  ContentTypeSchema,
  ContentType,
  CachedSchema,
} from 'dc-management-sdk-js';
import draft from './draft.json';
import localization from './localization.json';
import { Body } from '../../types/body';

export function defaultSchemaLookup(
  types: ContentType[],
  schemas: ContentTypeSchema[]
) {
  return async (uri: string): Promise<ContentTypeSchema | undefined> => {
    const type = types.find((x) => x.contentTypeUri === uri);
    let schema: ContentTypeSchema | undefined;

    if (type !== undefined) {
      try {
        const cached = (await type.related.contentTypeSchema.get())
          .cachedSchema as CachedSchema;

        schema = new ContentTypeSchema({
          body: JSON.stringify(cached),
          schemaId: cached.id,
        });
      } catch {
        // Cached schema could not be retrieved, try fetch it from the schema list.
      }
    }

    if (schema === undefined) {
      schema = schemas.find((x) => x.schemaId === uri);
    }

    return schema;
  };
}

export class AmplienceSchemaValidator {
  private ajv: Ajv;

  private cache: Map<string, PromiseLike<ValidateFunction>>;

  private schemas: ContentTypeSchema[] = [];

  constructor(
    private schemaLookup: (
      uri: string
    ) => Promise<ContentTypeSchema | undefined>
  ) {
    const ajv = new Ajv({
      strict: 'log',
      loadSchema: this.loadSchema.bind(this),
      schemaId: 'id',
      formats: {
        symbol: true,
        color: true,
        markdown: true,
        text: true,
      },
    });

    addFormats(ajv);

    ajv.addMetaSchema(draft, 'http://bigcontent.io/cms/schema/v1/core');
    ajv.addMetaSchema(
      localization,
      'http://bigcontent.io/cms/schema/v1/localization'
    );

    this.ajv = ajv;
    this.cache = new Map();
  }

  private loadSchema = async (uri: string): Promise<object> => {
    let internal = this.schemas.find((schema) => schema.schemaId === uri);

    if (internal !== undefined) {
      return JSON.parse(internal.body as string);
    }

    internal = await this.schemaLookup(uri);
    let body: object;

    if (internal === undefined) {
      try {
        const result = await (await fetch(uri)).text();
        body = JSON.parse(result.trim());
      } catch (e) {
        return {};
      }
    } else {
      body = JSON.parse(internal.body as string);

      this.schemas.push(internal);
    }

    return body;
  };

  private getValidatorCached(body: Body): PromiseLike<ValidateFunction> {
    const schemaId = body._meta.schema;

    const cacheResult = this.cache.get(schemaId);
    if (cacheResult != null) {
      return cacheResult;
    }

    const validator = (async (): Promise<ValidateFunction> => {
      const schema = await this.loadSchema(schemaId);

      if (schema) {
        // eslint-disable-next-line no-return-await
        return await this.ajv.compileAsync(schema);
      }
      throw new Error('Could not find Content Type Schema!');
    })();

    this.cache.set(schemaId, validator);
    return validator;
  }

  public async validate(body: Body): Promise<ErrorObject[]> {
    const validator = await this.getValidatorCached(body);
    const result = validator(body);
    return result ? [] : validator.errors || [];
  }
}
