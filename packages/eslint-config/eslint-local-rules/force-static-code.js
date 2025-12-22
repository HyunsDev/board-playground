// @ts-check

/**
 * 감지할 부모 클래스 목록입니다.
 * 이 목록에 포함된 클래스를 상속받는 모든 구현체는 static code가 필수입니다.
 */
const TARGET_BASE_CLASSES = new Set([
  'AbstractMessage',
  // Command
  'AbstractCommand',
  'BaseCommand',
  // Query
  'AbstractQuery',
  'BaseQuery',
  // Domain Event
  'AbstractDomainEvent',
  'BaseDomainEvent',
  // Job
  'AbstractJob',
  'BaseJob',
  // RPC
  'AbstractRpc',
  'BaseRpc',
  // Pub
  'AbstractPub',
  'BasePub',
  // Http Request
  'AbstractHttpRequest',
  'BaseHttpRequest',
]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: '특정 Base 클래스 상속 시 static code 속성 구현 강제',
    },
    messages: {
      missingCode:
        "Class '{{ className }}' inherits from '{{ parentName }}' and must implement 'static readonly code = ...'.",
    },
    schema: [],
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        // 1. 상속(extends) 여부 확인
        if (!node.superClass) return;

        // 2. 부모 클래스 이름 확인
        // (BaseCommand, AbstractMessage 등 지정된 목록에 있는지 확인)
        let parentName = '';
        if (node.superClass.type === 'Identifier') {
          parentName = node.superClass.name;
        } else {
          // MemberExpression 등의 경우(예: Messages.BaseCommand)는 복잡해지므로
          // 일단 단순 Identifier 상속만 처리하거나, 필요 시 로직 추가
          return;
        }

        if (!TARGET_BASE_CLASSES.has(parentName)) {
          return; // 우리가 감시하는 부모 클래스가 아니면 패스
        }

        // 3. [중요] 현재 클래스가 추상 클래스(abstract)인지 확인
        // 중간 단계의 추상 클래스(AbstractCommand 등)는 구현을 강제하지 않음
        if (node.abstract) {
          return;
        }

        const className = node.id ? node.id.name : 'AnonymousClass';

        // 4. static code 속성 찾기
        const hasStaticCode = node.body.body.some((member) => {
          if (member.type !== 'PropertyDefinition') return false;
          if (!member.static) return false;
          return member.key.name === 'code';
        });

        // 5. 없으면 에러 리포트
        if (!hasStaticCode) {
          context.report({
            node,
            messageId: 'missingCode',
            data: {
              className,
              parentName,
            },
          });
        }
      },
    };
  },
};
