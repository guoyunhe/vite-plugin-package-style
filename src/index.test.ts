import importPackageStyle from '.';

const code = `
import {
  something
} from 'rabbit-lyrics';

`;

const transformed = `import 'rabbit-lyrics/src/index.css';
import {
  something
} from 'rabbit-lyrics';

`;

describe('transformCode()', () => {
  it('say hello', async () => {
    const pulgin = importPackageStyle({
      rules: [{ include: ['rabbit-*'], resolveStyle: (pkg) => pkg + '/src/index.css' }],
    });
    expect((await (pulgin as any).transform(code)).code).toBe(transformed);
  });
});
