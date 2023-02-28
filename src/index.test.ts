import { importPackageStyle } from '.';

const code1 = `
import {
  something
} from 'rabbit-lyrics';

`;

const transformed1 = `import 'rabbit-lyrics/src/index.css';
import {
  something
} from 'rabbit-lyrics';

`;

const code2 = `
import {
  something
} from 'rabbit-lyrics';
import { foobar } from 'vite';
`;

const transformed2 = `import 'rabbit-lyrics/src/index.css';
import {
  something
} from 'rabbit-lyrics';
import { foobar } from 'vite';
`;

describe('transform', () => {
  it('single import', async () => {
    const pulgin = importPackageStyle({
      rules: [{ include: ['rabbit-*'], resolveStyle: (pkg) => pkg + '/src/index.css' }],
    });
    expect((await (pulgin as any).transform(code1)).code).toBe(transformed1);
  });
  it('match packages', async () => {
    const pulgin = importPackageStyle({
      rules: [{ include: ['rabbit-*'], resolveStyle: (pkg) => pkg + '/src/index.css' }],
    });
    expect((await (pulgin as any).transform(code2)).code).toBe(transformed2);
  });
});
