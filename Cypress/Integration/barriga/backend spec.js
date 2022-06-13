///reference types="cypress"/>


describe('Teste API', () => {
    //let token

    before(() => {
        cy.getToken('Perai@cheguei', 'demoro')
            // .then(tkn => {
            //     token = tkn
            // })
    })
    beforeEach(() => {
        cy.resetRest()
    })

    it('consulta conta', () => {
        cy.request({
            url: '/contas',
            method: 'POST',
            //headers: { Authorization: `JWT ${token}` },
            body: {
                nome: "mais outro"
            }
        }).as('response')

        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(201)
            expect(res.body).to.have.property('id')
            expect(res.body).to.have.property('nome', 'mais outro')
        })
    })

    it('Atualizar conta', () => {
        cy.inserirContaPorNome('Conta para alterar')
            .then(contaId => {
                cy.request({
                    url: `/contas/${contaId}`,
                    method: 'PUT',
                    //headers: { Authorization: `JWT ${token}` },
                    body: {
                        nome: "mais outro otras"
                    }
                }).as('response')

            })
        cy.get('@response').its('status').should('be.equal', 200)

    })
    it('consulta com mesmo nome de conta', () => {
        cy.request({
            url: '/contas',
            method: 'POST',
            //headers: { Authorization: `JWT ${token}` },
            body: {
                nome: "Conta mesmo nome"
            },
            failOnStatusCode: false
        }).as('response')

        cy.get('@response').then(res => {

            expect(res.status).to.be.equal(400)
            expect(res.body.error).to.be.equal('Já existe uma conta com esse nome!')
        })
    })

    it('criar transação', () => {
        cy.inserirContaPorNome('Conta para movimentacoes')
            .then(contaId => {
                cy.request({
                    url: '/transacoes',
                    method: 'POST',
                    //headers: { Authorization: `JWT ${token}` },
                    body: {
                        conta_id: contaId,
                        data_pagamento: Cypress.moment().add({ days: 1 }).format('DD/MM/YYYY'),
                        data_transacao: Cypress.moment().format('DD/MM/YYYY'),
                        descricao: "desc",
                        envolvido: "inter",
                        status: true,
                        tipo: "REC",
                        valor: "123"
                    }
                }).as('response')
            })
        cy.get('@response').its('status').should('be.equal', 201)
        cy.get('@response').its('body.id').should('exist')
        cy.get('@response').its('body.descricao').should('be.equal', 'desc')
        cy.get('@response').its('body.status').should('be.equal', true)
    })

    it('consulta de saldo', () => {
        cy.request({
            url: '/saldo',
            method: 'GET',
            //headers: { Authorization: `JWT ${token}` }
        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('534.00')
        })

        cy.request({
            method: 'GET',
            url: `/transacoes/`,
            //headers: { Authorization: `JWT ${token}` },
            qs: { descricao: 'Movimentacao 1, calculo saldo' }
        }).then(res => {
            cy.request({
                url: `/transacoes/ ${res.body[0].id}`,
                //headers: { Authorization: `JWT ${token}` },
                body: {
                    status: true
                }
            }).its('status').should('be.equal', 200)
        })

        cy.request({
            url: '/saldo',
            method: 'GET',
            //headers: { Authorization: `JWT ${token}` }
        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('534.00')
        })
    })

    it('deletar movimentacao', () => {
        cy.request({
            method: 'GET',
            url: '/transacoes',
            // headers: { Authorization: `JWT ${token}` },
            qs: { descricao: 'Movimentacao para exclusao' }
        }).then(res => {
            cy.request({
                url: `/transacoes/${res.body[0].id}`,
                method: 'DELETE',
                // headers: { Authorization: `JWT ${token}` },
            }).its('status').should('be.equal', 204)
        })
    })
}) 