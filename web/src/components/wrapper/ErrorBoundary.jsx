import { Component } from 'react'

export class ErrorBoundary extends Component {
	constructor(props) {
		super(props)
		this.state = {
			hasError: false,
			error: null,
		}
	}

	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error,
		}
	}

	componentDidCatch(error, errorInfo) {
		console.error('Uncaught app error:', error, errorInfo)
	}

	handleReload = () => {
		window.location.reload()
	}

	render() {
		if (this.state.hasError) {
			return (
				<section className="screen">
					<div className="screen__header">
						<span className="screen__kicker">Ошибка</span>
						<h2 className="screen__title">Что-то пошло не так</h2>
						<p className="screen__desc">
							Произошла неожиданная ошибка интерфейса. Попробуйте перезагрузить страницу.
						</p>
						{import.meta.env.DEV && this.state.error ? (
							<pre className="screen__desc" style={{ whiteSpace: 'pre-wrap' }}>
								{String(this.state.error?.stack || this.state.error?.message || this.state.error)}
							</pre>
						) : null}
						<button type="button" className="btn" onClick={this.handleReload}>
							Перезагрузить
						</button>
					</div>
				</section>
			)
		}

		return this.props.children
	}
}