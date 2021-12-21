import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Map, StateMachine} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Runtime, Function, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class SfsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const commonOptions = {
      runtime: Runtime.NODEJS_14_X, // ランタイムの指定
      code: Code.fromAsset('dist'), // ソースコードのディレクトリ -> npm run build
      memorySize: 1024, // メモリーの指定
      timeout: Duration.seconds(60),
      allowPublicSubnet: true,
    };
    // Lambda Function 作成
    const firstTask = new Function(this, 'firstTaskHandler', {
      ...commonOptions,
      functionName: 'firstTaskHandler',
      handler: 'first_task.handler',
    });
    const iteratorTask = new Function(this, 'iteratorTaskHandler', {
      ...commonOptions,
      functionName: 'iteratorTaskHandler',
      handler: 'iterator_task.handler',
    });
    const endTask = new Function(this, 'endTaskHandler', {
      ...commonOptions,
      functionName: 'endTaskHandler',
      handler: 'end_task.handler',
    });

    // Step Functionのタスク定義
    const firstTaskInvoke = new LambdaInvoke(this, 'firstTaskInvoke', {
      lambdaFunction: firstTask,
    });
    // Step Functionのiteratorタスク定義
    const iteratorTaskMap = new Map(this, 'iteratorTaskMap', {
      maxConcurrency: 0, // 同時実行上限（0の場合リソースの許す限り上限なし）
      inputPath: '$.Payload', // Lambdaのevent引数の中でiteratorで使いたいパラメータのrootを設定。
      itemsPath: '$.arr', // inputPathの中で、iteratorでloop変数となる配列のプロパティを指定。つまりこの場合 event.Payload.arrを指定していることになる。
      parameters: {
        'param.$': '$$.Map.Item.Value', // loop変数の名前を指定。$$.Map.Item.Valueがloop変数であることを表している。
        'fixedVal.$': '$.fixedVal', // inputPathの中で、どのiteratorでも固定で使いたいプロパティがあればこのように設定する。何個でもいい。
      },
      resultPath: '$.Payload.result', // iteratorの処理結果を格納するプロパティを設定。
      outputPath: '$.Payload', // 後続のタスクにわたすプロパティを設定。resultPathがこのプロパティ内に含まれていない場合、結果を返すことができなくなるため、resultPathはoutputPath内に指定するのが望ましい。
    });
    // Step Functionのタスク定義
    const iteratorTaskInvoke = new LambdaInvoke(this, 'iteratorTaskInvoke', {
      lambdaFunction: iteratorTask,
      payloadResponseOnly: true,
    });
    // Step Functionのタスク定義
    const endTaskInvoke = new LambdaInvoke(this, 'endTaskInvoke', {
      lambdaFunction: endTask,
      payloadResponseOnly: true,
    });
    iteratorTaskMap.iterator(iteratorTaskInvoke);

    // step function定義
    const definition = firstTaskInvoke
      .next(iteratorTaskMap)
      .next(endTaskInvoke);

    const stateMachine = new StateMachine(this, 'MyStateMachine', { definition });

  }
}
