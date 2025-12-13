// @ts-check

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'AbstractMessage 상속 시 static code 속성 구현 강제',
    },
    messages: {
      missingCode: "Class '{{ className }}' must implement 'static readonly code = ...'.",
    },
    schema: [],
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        // 1. 상속 여부 및 대상 확인
        if (!node.superClass) return;

        // superClass가 Identifier가 아닌 경우(예: MemberExpression)도 있을 수 있으므로 체크
        if (node.superClass.type !== 'Identifier' || node.superClass.name !== 'AbstractMessage') {
          return;
        }

        // [추가된 로직] 2. 현재 클래스가 'abstract'인지 확인
        // 추상 클래스라면 static code 구현을 강제하지 않고 무시합니다.
        if (node.abstract) {
          return;
        }

        const className = node.id ? node.id.name : 'AnonymousClass';

        // 3. static code 속성 찾기
        const hasStaticCode = node.body.body.some((member) => {
          if (member.type !== 'PropertyDefinition') return false;
          if (!member.static) return false;
          return member.key.name === 'code';
        });

        // 4. 에러 리포트
        if (!hasStaticCode) {
          context.report({
            node,
            messageId: 'missingCode',
            data: { className },
          });
        }
      },
    };
  },
};
