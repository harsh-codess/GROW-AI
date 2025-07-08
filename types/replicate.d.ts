declare module 'replicate' {
  interface ReplicateOptions {
    auth: string;
  }

  interface RunInput {
    input: {
      image: string;
      prompt: string;
      [key: string]: any;
    };
  }

  class Replicate {
    constructor(options: ReplicateOptions);
    run(model: string, input: RunInput): Promise<string>;
  }

  export default Replicate;
}
